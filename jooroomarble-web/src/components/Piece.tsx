import React from 'react';
import '../styles/BoardPage.css';
import pieceImage from '../assets/game_piece.png';

const Piece: React.FC = () => {
  return <img src={pieceImage} alt="Game Piece" className="piece" />;
};

export default Piece;
