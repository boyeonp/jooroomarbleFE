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

  /* ───────────────────────── 최초 로드 ───────────────────────── */
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

    /* ───────── 서버 이벤트: 턴 변경 ───────── */
    socket.on('turn_changed', (data: any) => {
      const { dice, fromPos, toPos, tile } = data;
      setRolling(true);
      setDiceValue(dice);

      /* 주사위 3D 애니 끝나면 실행 */
      const handleRollEnd = () => {
        setRolling(false);
        setShowDicePopup(true);

        setTimeout(() => {
          setShowDicePopup(false);

          /* 말 이동 애니메이션 */
          animatePieceMovement(fromPos, toPos, () => {
            /* 이동 끝 후 타일 처리 */
            setTileData(prev => (prev.find(t => t.idx === tile.idx) ? prev : [...prev, tile]));

            /* 폭탄 칸 적립 */
            if (tile.defaultAction?.type === 'bomb') {
              setBombCount(prev => {
                const next = prev + 1;
                bombCountRef.current = next;           // ✨ 수정: ref 동기화
                return next;
              });
            }

            /* START 칸 체크 & 팝업 */
            if (tile.idx === 0) {
              const currentCount = bombCountRef.current;   // ✨ 수정: 항상 최신 값
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
              bombCountRef.current = 0;                    // ✨ 수정: ref 리셋
              setBombCount(0);                             // ✨ 수정: state 리셋
            } else {
              setTimeout(() => setActivePopup({ tile }), 800);
            }
          });
        }, 800);
      };

      /* Dice3D 가 1.5초 돌도록 맞춰줌 */
      setTimeout(handleRollEnd, 1500);
    });

    return () => {
      socket.emit('leave_room', { code });
      socket.disconnect();
    };
  }, []);

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
