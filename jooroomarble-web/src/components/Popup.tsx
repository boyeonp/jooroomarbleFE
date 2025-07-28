import React from 'react';
import '../styles/BoardPage.css';

interface PopupProps {
    title: string;
    description: string;
    onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({title, description, onClose}) => {
    return (
        <div className='popup-overlay' onClick={onClose}>
            <div className="popup-box" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                <p>{description}</p>
                <button onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default Popup;