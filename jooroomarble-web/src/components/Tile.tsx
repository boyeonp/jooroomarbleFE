import React from 'react';
import '../styles/BoardPage.css';

interface TileProps {
  text: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const Tile: React.FC<TileProps> = ({ text, className, onClick, children }) => {
  return (
    <div className={`tile ${className}`} onClick={onClick}>
      <div className="tile-text">{text}</div> {/* ✅ 텍스트 래핑 */}
      <div className="pieces-container">{children}</div>
    </div>
  );
};

export default Tile;
