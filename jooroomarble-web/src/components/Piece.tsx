
import React from 'react';
import '../styles/BoardPage.css';
import pieceImage from '../assets/game_piece.png';

const Piece: React.FC = () => {
  return (
    <div
      className="piece"
      style={{
        width: '60px',
        height: '60px',
        backgroundImage: `url(${pieceImage})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        position: 'absolute', // ✅ 겹치기 위해 절대 위치
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)', // ✅ 정확히 타일 중앙에 위치
        zIndex: 5, // ✅ 타일 텍스트 위에 렌더링되도록
      }}
    />
  );
};
export default Piece;
