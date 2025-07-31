// components/Popup.tsx
import React from 'react';
import '../styles/BoardPage.css';

interface PopupProps {
  title: string;
  description: React.ReactNode;
  onClose: () => void;
  variant?: 'board' | 'roll'; // ✅ 팝업 구분용
}

const Popup: React.FC<PopupProps> = ({ title, description, onClose, variant = 'board' }) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className={`popup-box popup-${variant}`} onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <div>{description}</div>
        {/* ✅ 가운데 정렬된 닫기 버튼 */}
        <div className="popup-footer">
          <button className="popup-close-button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
