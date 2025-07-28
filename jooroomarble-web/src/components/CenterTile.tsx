import React from 'react';
import '../styles/BoardPage.css';

interface CenterTileProps {
  onDiceClick: () => void;
}

const CenterTile: React.FC<CenterTileProps> = ({ onDiceClick }) => {
  return (
    <div className="center-tile">
      <h1 className="center-title">
        몰캠<br />주루마블
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ fontSize: '50px' }}>🎲</span>
        <button className="dice-button" onClick={onDiceClick}>
          주사위 던지기
        </button>
      </div>
    </div>
  );
};

export default CenterTile;
