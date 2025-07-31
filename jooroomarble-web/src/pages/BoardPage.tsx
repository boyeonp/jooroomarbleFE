import React, { useEffect, useRef, useState } from 'react'; // ✨ 수정: useRef 추가
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

  /* ───────────────────────── state & ref ───────────────────────── */
  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [showDicePopup, setShowDicePopup] = useState(false);
  const [players, setPlayers] = useState<Player[]>([{ id: 1, position: 0 }]);
  const [activePopup, setActivePopup] = useState<{ tile: TileInfo } | null>(null);
  const [tileData, setTileData] = useState<TileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [bombCount, setBombCount] = useState(0);
  const bombCountRef = useRef(0);                        // ✨ 수정: 최신 값을 보관

  /* ───────────────────────── 데이터 요청 ───────────────────────── */
  const fetchInitialTiles = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const guestId = localStorage.getItem('guestId');
      if ((!token && !guestId) || !code) return;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const res = await axios.get(`https://api.jooroomarble.store/sessions/${code}/board`, { headers });
      setTileData(res.data?.map?.tiles || []);
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

  /* ───────────────────────── 말 애니메이션 ───────────────────────── */
  const animatePieceAlongPath = (path: number[], onEnd: () => void) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index >= path.length) {
        clearInterval(interval);
        onEnd();
        return;
      }
      setPlayers([{ id: 1, position: path[index] }]);
      index++;
    }, 350); // 애니메이션 속도 약간 빠르게 조정
  };

  /* ─────────────────── 이동 종료 후 로직 ─────────────────── */
  const onMoveEnd = (finalTile: TileInfo) => {
    if (!finalTile) return;
    setTileData(prev => (prev.find(t => t.idx === finalTile.idx) ? prev : [...prev, finalTile]));
    if (finalTile.defaultAction?.type === 'bomb') {
      setBombCount(prev => {
        const next = prev + 1;
        bombCountRef.current = next;
        return next;
      });
    }
    if (finalTile.idx === 0) {
      const currentCount = bombCountRef.current;
      setActivePopup({
        tile: { ...finalTile, description: 'START 적립 알림', defaultAction: { type: 'popup', message: `${currentCount}잔이 적립되어 있습니다!` } },
      });
      bombCountRef.current = 0;
      setBombCount(0);
    } else {
      setTimeout(() => setActivePopup({ tile: finalTile }), 800);
    }
  };

  /* ─────────────────── 최초 로드 & 소켓 리스너 ─────────────────── */
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

    const handleTurnChanged = (data: any) => {
      const { dice, fromPos, toPos, tile } = data;
      setRolling(true);
      setDiceValue(dice);

      const handleRollEnd = () => {
        setRolling(false);
        setShowDicePopup(true);
        setTimeout(() => {
          setShowDicePopup(false);

          let path: number[] = [];
          let current = fromPos;

          // 서버가 보내준 toPos와 주사위 값을 기반으로 경로를 재구성합니다.
          // 이는 클라이언트에서 정확한 애니메이션을 보여주기 위함입니다.
          
          // 1. 주사위 값만큼 한 칸씩 이동하며 경로 생성
          path.push(current);
          for (let i = 0; i < dice; i++) {
            // 15번 칸(포탈)에 도착하면 24번으로 점프
            if (current === 15) {
              current = 24;
            } else {
              current = (current + 1);
              // 메인 보드(0-23) 순환 처리
              if (current > 23 && current < 29) {
                 // 이전에 있던 칸이 대각선이 아니었다면, 0으로 보냄
                 const prevPos = path[path.length -1];
                 if(prevPos < 24) current = 0;
              }
            }
            path.push(current);
          }

          // 2. 최종 도착지가 특수 미끄럼틀 칸인지 확인하고 경로에 추가
          const finalPos = path[path.length - 1];
          if (finalPos === 23 && toPos === 0) {
            path.push(0);
          } else if (finalPos === 28 && toPos === 5) {
            path.push(5);
          }
          
          animatePieceAlongPath(path, () => onMoveEnd(tile));

        }, 800);
      };
      setTimeout(handleRollEnd, 1500);
    };

    socket.on('turn_changed', handleTurnChanged);
    return () => {
      socket.off('turn_changed', handleTurnChanged);
    };
  }, [code, tileData]);

  /* ───────────────────────── 기타 핸들러 ───────────────────────── */
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
      alert(e.response?.status === 403 ? '❌ 방장만 종료 가능' : '⚠️ 오류가 발생했습니다.');
    }
  };

  /* ───────────────────────── 렌더 ───────────────────────── */
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
              .filter((t): t is TileInfo => !!t)
              .map(tile => {
                const isDiagonal = tile.idx >= 24 && tile.idx <= 28;
                return (
                  <Tile
                    key={tile.idx}
                    className={`tile tile-${tile.idx}`}
                    text={`${tile.defaultAction?.type === 'bomb' ? '💣 ' : ''}${tile.description}`}
                  >
                    {!isDiagonal &&
                      players.filter(p => p.position === tile.idx).map(p => <Piece key={p.id} />)}
                  </Tile>
                );
              })}

            <div className="center-tile-area">
              <div className="bomb-counter-box">
                <span className="bomb-icon">💣</span>
                <span className="bomb-count">
                  현재 적립된 잔: <span style={{ color: 'red' }}>{bombCount}잔</span>
                </span>
              </div>

              <CenterTile />
              <div className="dice-container-wrapper">
                <Dice3D number={diceValue} rolling={rolling} onRollEnd={() => {}} />
              </div>
              <div className="announce">순서에 따라 휴대폰에서 주사위를 돌려주세요.</div>

              {[24, 25, 26, 27, 28].map((pos, i) => (
                <div key={pos} className={`diagonal-tile diagonal-tile-${i}`}>
                  <div className="text">{i % 2 === 0 ? '술' : '물'}</div>
                  {players.filter(p => p.position === pos).map(p => <Piece key={p.id} />)}
                </div>
              ))}
            </div>
          </div>

          {showDicePopup && (
            <Popup
              title={`🎲 주사위 결과: ${diceValue}칸 이동`}
              description=""
              onClose={closeDicePopup}
              variant="board"
            />
          )}

          {activePopup && (
            <Popup
              title={activePopup.tile.description}
              description={
                activePopup.tile.defaultAction?.type === 'popup'
                  ? activePopup.tile.defaultAction.message
                  : ''
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
