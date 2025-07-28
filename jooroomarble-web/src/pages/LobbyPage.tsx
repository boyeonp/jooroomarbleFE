import React, { useState } from 'react';
import '../styles/LobbyPage.css';
import { useNavigate } from 'react-router-dom';

const LobbyPage: React.FC = () => {
    const maps = [
        {id: 1, title: '몰입 주루마블', editable: false},
        {id: 2, title: '00 동아리', editable: true},
    ];

    const [selectedMap, setSelectedMap] = useState<{id: number, title: string} | null>(null);

    const handlePreview = (map: {id: number; title: string }) => {
        setSelectedMap(map);
    };

    const handleClosePopup =() =>{
        setSelectedMap(null);
    }

    const navigate = useNavigate();

    return (
        <div className="lobby-page">
            <h1 className="lobby-title">맵 리스트</h1>
            <div className="map-container">
                {maps.map((map) => (
                    <div key={map.id} className="map-card">
                        <div className='map-title'>{map.title}</div>
                        <button className="map-preview-button" onClick={() => handlePreview(map)}>맵 미리보기</button>
                        <div className="map-buttons">
                            <button className='map-button' onClick={() => navigate('/game/waitingroom')}>플레이</button>
                            {map.editable && <button className="map-button">수정</button>}
                        </div>
                    </div>
                ))}
                <div className="map-card new-map-card">
                    <div className="plus-icon">+</div>
                    <div className="new-map-text">새 맵 만들기</div>
                </div>
            </div>

            {selectedMap &&  (
                <div className='popup-overlay' onClick={handleClosePopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedMap.title}</h2>
                        <div className="map-image-placeholder"> 여기에 맵 이미지 들어감</div>
                        <button onClick={handleClosePopup} className="close-button">닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LobbyPage;