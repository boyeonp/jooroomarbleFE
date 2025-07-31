import React, { useEffect, useState } from 'react';
import Tile from '../components/Tile';
import CenterTile from '../components/CenterTile';
import Popup from '../components/Popup';
import Piece from '../components/Piece';
import Dice3D from '../components/Dice3D';
import '../styles/BoardPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../socket/socket';

interface Player {
  id: number;
  position: number;
}

interface TileInfo {
  idx: number;
  description: string;
  defaultAction: { type: string; message?: string };
}

const tileOrder = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  10, 11, 12, 13, 14, 15, 16, 17,
  18, 19, 20, 21, 22, 23,
];

const BoardPage: React.FC = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [showDicePopup, setShowDicePopup] = useState(false);
  const [players, setPlayers] = useState<Player[]>([{ id: 1, position: 0 }]);
  const [activePopup, setActivePopup] = useState<{ tile: TileInfo } | null>(null);
  const [tileData, setTileData] = useState<TileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [bombCount, setBombCount] = useState(0);

  const fetchInitialTiles = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const guestId = localStorage.getItem('guestId');
      if ((!token && !guestId) || !code) return;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const res = await axios.get(`https://api.jooroomarble.store/sessions/${code}/board`, { headers });
      const mapTiles = res.data?.map?.tiles || [];
      setTileData(mapTiles);
    } catch (e) {
      console.error('초기 보드 데이터 로딩 실패:', e);
    }
  };

  const fetchGameState = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const guestId = localStorage.getItem('guestId');
      if ((!token && !guestId) || !code) return;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const res = await axios.get(`https://api.jooroomarble.store/sessions/${code}/status`, { headers });
      const myPlayer = res.data.participants.find((p: any) => p.guestId === guestId);
      if (myPlayer) setPlayers([{ id: 1, position: res.data.currentPos }]);
      const tile = res.data.currentTile;
      setTileData(prev => (prev.find(t => t.idx === tile.idx) ? prev : [...prev, tile]));
    } catch (e) {
      console.error('게임 상태 가져오기 오류:', e);
    }
  };

  const animatePieceMovement = (from: number, to: number, onEnd: () => void) => {
    const step = from < to ? 1 : -1;
    let current = from;
    const interval = setInterval(() => {
      current += step;
      setPlayers([{ id: 1, position: current }]);
      if (current === to) {
        clearInterval(interval);
        onEnd();
      }
    }, 300);
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchInitialTiles();
      await fetchGameState();
      setLoading(false);
    };

    initialize();

    if (!code) return;
    if (!socket.connected) socket.connect();

    socket.emit('join_room', { code });

    socket.on('turn_changed', (data: any) => {
      const { dice, fromPos, toPos, tile } = data;
      setRolling(true);
      setDiceValue(dice);

      const handleRollEnd = () => {
        setRolling(false);
        setShowDicePopup(true);

        setTimeout(() => {
          setShowDicePopup(false);

          animatePieceMovement(fromPos, toPos, () => {
            setTimeout(() => {
              setTileData(prev =>
                prev.find(t => t.idx === tile.idx) ? prev : [...prev, tile]
              );

              if (tile.defaultAction?.type === 'bomb') {
                setBombCount(prev => {
                  const updated = prev + 0.5;
                  console.log(`폭탄 칸 도착! 현재 적립된 잔 수: ${updated}`);
                  return updated;
                });
              }

              if (tile.idx === 0) {
                const currentCount = bombCount;
                setActivePopup({
                  tile: {
                    ...tile,
                    description: 'START 적립 알림',
                    defaultAction: {
                      type: 'popup',
                      message: `${currentCount}잔이 적립되어 있습니다!`,
                    },
                  },
                });
                setBombCount(0);
              } else {
                setTimeout(() => {
                  setActivePopup({ tile });
                }, 1000);
              }
            }, 500);
          });
        }, 1000);
      };

      setTimeout(handleRollEnd, 1500);
    });

    return () => {
      socket.emit('leave_room', { code });
      socket.disconnect();
    };
  }, []);

  const closeDicePopup = () => setShowDicePopup(false);
  const handleClosePopup = () => setActivePopup(null);

  const handleGameEnd = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const guestId = localStorage.getItem('guestId');
      if (!code || (!token && !guestId)) return;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      await axios.delete(`https://api.jooroomarble.store/sessions/${code}`, { headers });
      alert('게임이 종료되었습니다.');
      navigate('/lobby');
    } catch (e: any) {
      if (e.response?.status === 403) {
        alert('❌ 방장만 게임을 종료할 수 있습니다.');
      } else {
        alert('⚠️ 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="board-page-container">
      {loading ? (
        <div className="loading-screen">게임판 불러오는 중...</div>
      ) : (
        <>
          <button className="game-exit-button" onClick={handleGameEnd}>게임 종료</button>

          <div className="board-container">
            {tileOrder
              .map(idx => tileData.find(t => t.idx === idx))
              .filter((tile): tile is TileInfo => !!tile)
              .map(tile => {
                const isDiagonal = tile.idx >= 24 && tile.idx <= 28;
                return (
                  <Tile
                    key={tile.idx}
                    className={`tile tile-${tile.idx}`}
                    text={`${tile.defaultAction?.type === 'bomb' ? '💣 ' : ''}${tile.description}`}
                  >
                    {!isDiagonal && players.filter(p => p.position === tile.idx).map(p => (
                      <Piece key={p.id} />
                    ))}
                  </Tile>
                );
              })}

            <div className="center-tile-area">
              <div className="bomb-counter-box">
                <span className="bomb-icon">💣</span>
                <span className="bomb-count">현재 적립된 잔: <span style={{ color: 'red' }}>{bombCount}잔</span></span>
              </div>
              <CenterTile />
              <div className="dice-container-wrapper">
                <Dice3D number={diceValue} rolling={rolling} onRollEnd={() => { }} />
              </div>
              <div className='announce'>순서에 따라 휴대폰에서 주사위를 돌려주세요.</div>
              {[24, 25, 26, 27, 28].map((pos, i) => (
                <div key={pos} className={`diagonal-tile diagonal-tile-${i}`}>
                  <div className="text">{i % 2 === 0 ? '술' : '물'}</div>
                  {players.filter(p => p.position === pos).map(p => (
                    <Piece key={p.id} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {showDicePopup && (
            <Popup
              title={`🎲 주사위 결과: ${diceValue}칸 이동`}
              description=''
              onClose={closeDicePopup}
              variant='board'
            />
          )}

          {activePopup && (
            <Popup
              title={activePopup.tile.description}
              description={
                <>
                  {activePopup.tile.defaultAction?.type === 'popup' && (
                    <div>{activePopup.tile.defaultAction.message}</div>
                  )}
                </>
              }
              onClose={handleClosePopup}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BoardPage;
