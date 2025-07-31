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
    }, 350);
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
      const { fromPos, toPos, tile } = data;
      setRolling(true);
      setDiceValue(data.dice);

      const handleRollEnd = () => {
        setRolling(false);
        setShowDicePopup(true);
        setTimeout(() => {
          setShowDicePopup(false);

          let path: number[] = [];
          
          // Case 1: 포탈 진입 (시작은 메인보드, 끝은 대각선)
          if (fromPos < 24 && toPos >= 24 && toPos <= 28) {
            for (let i = fromPos; i <= 15; i++) path.push(i);
            for (let i = 24; i <= toPos; i++) path.push(i);
          }
          // Case 2: 대각선 위에서 이동
          else if (fromPos >= 24 && toPos >= 24 && toPos <= 28) {
            for (let i = fromPos; i <= toPos; i++) path.push(i);
          }
          // Case 3: 대각선에서 탈출 (28 -> 5)
          else if (fromPos >= 24 && toPos === 5) {
            for (let i = fromPos; i <= 28; i++) path.push(i);
            path.push(5);
          }
          // Case 4: 23 -> 0 미끄럼틀
          else if (toPos === 0 && fromPos !== 0) { // 0->0 이동이 아닌 경우
            let current = fromPos;
            path.push(current);
            while (current !== 23) {
              current = (current + 1) % 24;
              path.push(current);
            }
            path.push(0);
          }
          // Case 5: 그 외 일반 이동
          else {
            let current = fromPos;
            path.push(current);
            // toPos에 도달할 때까지 경로 추가 (순환 포함)
            while (current !== toPos) {
              current = (current + 1) % 24;
              path.push(current);
            }
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
