import React, { useState } from 'react';
import Tile from '../components/Tile';
import CenterTile from '../components/CenterTile';
import Popup from '../components/Popup';
import Piece from '../components/Piece';
import '../styles/BoardPage.css';

const tileData = [
    { id: 0, text: '금픽 마셔', detail: '4주 동안 금픽에 한 번이라도 선정된 사람은 마십니다.', special: 'gold' },
    { id: 1, text: '랜덤 게임', detail: '즉석에서 랜덤 게임을 하나 진행하세요.' },
    { id: 2, text: 'mac 안 쓰는 사람 마셔', detail: '맥북을 사용하지 않는 사람은 마십니다.' },
    { id: 3, text: '02년생 마셔', detail: '2002년생 이하인 사람만 마십니다.' },
    { id: 4, text: '물 / 술 시작 !!', detail: '중앙 경로로 들어갑니다. 술/물 선택해서 진입!' },
    { id: 5, text: '4분반 외모순위 1~5위 마셔', detail: '자기 기준 외모 Top 5면 마십니다.' },
    { id: 6, text: '스크럼 지각한 사람 마셔', detail: '스크럼 회의에 지각한 사람은 마십니다.' },
    { id: 7, text: '훈민정음 (1바퀴동안)', detail: '모든 대화를 훈민정음처럼 해야 함!' },
    { id: 8, text: '눈치 게임', detail: '눈치 게임을 한 판 진행합니다.' },
    { id: 9, text: '다같이 짠 !!', detail: '모두가 함께 짠 후 마십니다.', special: 'gold' },
    { id: 10, text: '엠준위 빼고 마셔', detail: '엠준위만 제외하고 전원 마십니다.' },
    { id: 11, text: '이미지 게임', detail: '이미지 게임을 한 판 진행합니다.' },
    { id: 12, text: '타대생 마셔', detail: '타 학교 학생은 마십니다.' },
    { id: 13, text: '걸린사람 팀메이트 마셔', detail: '게임에 걸린 사람과 같은 팀도 마십니다.' },
    { id: 14, text: '나빼고 다 마셔', detail: '본인을 제외한 모두가 마십니다.' },
    { id: 15, text: '랜덤 게임', detail: '즉석에서 랜덤 게임을 하나 진행하세요.', special: 'gold' },
    { id: 16, text: '좌3우3 마시기', detail: '왼쪽, 오른쪽 3명씩 마십니다.' },
    { id: 17, text: '카이스트 마셔', detail: '카이스트 출신은 마십니다.' },
    { id: 18, text: '손병호 게임', detail: '손병호 게임을 진행하세요.' },
    { id: 19, text: '시작 (적립 칸)', detail: '게임 시작 위치입니다.', special: 'pink' },
    { id: 20, text: '너 마셔', detail: '지목해서 한 명 마시게 하기' },
    { id: 21, text: '학과 이름에 "컴퓨터" 있는 사람 마셔', detail: '컴퓨터가 들어간 학과명이면 마십니다.' },
    { id: 22, text: 'mbti I 마셔', detail: '내향형 사람은 마십니다.' },
    { id: 23, text: '공산당', detail: '공산당처럼 행동해보세요(?)' },
    // Diagonal path tiles
    { id: 24, text: '술', detail: '술을 마시세요.' },
    { id: 25, text: '물', detail: '물을 마시세요.' },
    { id: 26, text: '술', detail: '술을 마시세요.' },
    { id: 27, text: '물', detail: '물을 마시세요.' },
    { id: 28, text: '술', detail: '술을 마시세요.' },
];

const diagonalPathIds = [24, 25, 26, 27, 28];

const BoardPage: React.FC = () => {
  const [players, setPlayers] = useState([
    { id: 1, position: 19 }, // Start at '시작' tile (ID 19)
  ]);
  const [activePopup, setActivePopup] = useState<{ tileId: number } | null>(null);

  const handleDiceRoll = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    
    setPlayers(prevPlayers => {
      const currentPlayer = prevPlayers[0];
      const newPosition = (currentPlayer.position - roll + tileData.length) % tileData.length;

      // Set a timeout to show the popup after 1 second
      setTimeout(() => {
        setActivePopup({ tileId: newPosition });
      }, 1000);

      // Return the new state to update the piece position immediately
      return [{ ...currentPlayer, position: newPosition }];
    });
  };

  const handleTileClick = (tileId: number) => {
    setActivePopup({ tileId });
  };

  const handleClosePopup = () => {
    setActivePopup(null);
  };

  const getTileById = (id: number) => tileData.find(tile => tile.id === id);

  return (
    <div className="board-page-container">
      <button className="game-exit-button">게임 종료</button>
      <div className="board-container">
        {tileData.filter(tile => !diagonalPathIds.includes(tile.id)).map(tile => (
          <Tile
            key={tile.id}
            className={`tile-${tile.id} ${tile.special || ''}`}
            text={tile.text}
            onClick={() => handleTileClick(tile.id)}
          >
              {players
                .filter(p => p.position === tile.id)
                .map(p => (
                  <Piece key={p.id} />
                ))}
          </Tile>
        ))}
        <div className="center-tile-area">
          <CenterTile onDiceClick={handleDiceRoll} />
          {diagonalPathIds.map((id, index) => {
            const tile = getTileById(id);
            if (!tile) return null;
            return (
              <div
                key={tile.id}
                className={`diagonal-tile diagonal-tile-${index}`}
                onClick={() => handleTileClick(tile.id)}
              >
                <span>{tile.text}</span>
              </div>
            );
          })}
        </div>
      </div>
      {activePopup && (
        <Popup
          title={getTileById(activePopup.tileId)?.text || ''}
          description={getTileById(activePopup.tileId)?.detail || ''}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default BoardPage;
