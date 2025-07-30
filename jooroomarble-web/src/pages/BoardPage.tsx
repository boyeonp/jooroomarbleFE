// ✅ 수정된 BoardPage.tsx (사다리 포함 + 아래쪽 사다리 타일 제거)
import React, { useEffect, useState } from 'react';
import Tile from '../components/Tile';
import CenterTile from '../components/CenterTile';
import Popup from '../components/Popup';
import Piece from '../components/Piece';
import Dice3D from '../components/Dice3D';
import '../styles/BoardPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Player {
  id: number;
  position: number;
}

interface TileInfo {
  idx: number;
  description: string;
  defaultAction: { type: string; message?: string };
}

const BoardPage: React.FC = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [dicePopup, setDicePopup] = useState(false);
  const [players, setPlayers] = useState<Player[]>([{ id: 1, position: 0 }]);
  const [activePopup, setActivePopup] = useState<{ tile: TileInfo } | null>(null);
  const [tileData, setTileData] = useState<TileInfo[]>([]);

  const fetchInitialTiles = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const guestId = localStorage.getItem('guestId');
      if (!token && !guestId || !code) return;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const res = await axios.get(`http://34.64.111.205/sessions/${code}/board`, { headers });
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
      const res = await axios.get(`http://34.64.111.205/sessions/${code}/status`, { headers });
      const myPlayer = res.data.participants.find((p: any) => p.guestId === guestId);
      if (myPlayer) setPlayers([{ id: 1, position: res.data.currentPos }]);
      const tile = res.data.currentTile;
      setTileData(prev => (prev.find(t => t.idx === tile.idx) ? prev : [...prev, tile]));
    } catch (e) {
      console.error('게임 상태 가져오기 오류:', e);
    }
  };

  useEffect(() => {
    fetchInitialTiles();
    fetchGameState();
  }, []);

  const handleDiceRoll = async () => {
    if (rolling || !code) return;
    const guestId = localStorage.getItem('guestId');
    try {
      setRolling(true);
      const res = await axios.post(`http://34.64.111.205/sessions/${code}/turn`, { guestId }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const { dice, toPos, tile } = res.data;
      setDiceValue(dice);
      setTimeout(() => {
        setPlayers([{ id: 1, position: toPos }]);
        setRolling(false);
        setDicePopup(true);
        setTileData(prev => (prev.find(t => t.idx === tile.idx) ? prev : [...prev, tile]));
        setActivePopup({ tile });
      }, 1000);
    } catch (e: any) {
      console.error('주사위 굴리기 오류:', e);
      alert(e.response?.data?.message || '주사위 굴리기 중 오류가 발생했습니다.');
      setRolling(false);
    }
  };

  const closeDicePopup = () => setDicePopup(false);
  const handleClosePopup = () => setActivePopup(null);

  const handleGameEnd = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const guestId = localStorage.getItem('guestId');
      if (!code || (!token && !guestId)) return;


      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      await axios.delete(`http://34.64.111.205/sessions/${code}`, { headers });

      alert('게임이 종료되었습니다.');
      navigate('/lobby');
    } catch (e: any) {
      console.error('게임 종료 실패:', e);
      alert('게임 종료 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="board-page-container">
      <button className="game-exit-button" onClick={handleGameEnd}>게임 종료</button>
      <div className="board-container">
        {tileData
          .filter(tile => tile.idx < 24 || tile.idx > 28) // ✅ idx 24~28 사다리 타일은 제외하고 렌더링
          .map(tile => (
            <Tile key={tile.idx} className={`tile tile-${tile.idx}`} text={tile.description}>
              {players.filter(p => p.position === tile.idx).map(p => (<Piece key={p.id} />))}
            </Tile>
          ))}

        {/* 중앙 영역 */}
        <div className="center-tile-area">
          <CenterTile />
          <div className="dice-container-wrapper">
            <Dice3D number={diceValue} rolling={rolling} />
          </div>
          <button className="dice-button" onClick={handleDiceRoll}>주사위 던지기</button>

          {/* 사다리 타일 추가 */}
          <div className="diagonal-tile diagonal-tile-0"><div className="text">술</div></div>
          <div className="diagonal-tile diagonal-tile-1"><div className="text">물</div></div>
          <div className="diagonal-tile diagonal-tile-2"><div className="text">술</div></div>
          <div className="diagonal-tile diagonal-tile-3"><div className="text">물</div></div>
          <div className="diagonal-tile diagonal-tile-4"><div className="text">술</div></div>
        </div>
      </div>

      {dicePopup && (
        <Popup
          title={`🎲 주사위 결과: ${diceValue}`}
          description={`${diceValue} 칸 이동!`}
          onClose={closeDicePopup}
        />
      )}

      {activePopup && (
        <Popup
          title={activePopup.tile.description}
          description={
            activePopup.tile.defaultAction?.type === 'popup'
              ? activePopup.tile.defaultAction.message || '특수 행동 없음'
              : activePopup.tile.defaultAction?.type || '일반 칸입니다'
          }
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default BoardPage;
