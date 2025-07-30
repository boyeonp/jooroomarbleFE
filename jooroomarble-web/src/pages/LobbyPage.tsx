import React, { use, useEffect, useState } from 'react';
import '../styles/LobbyPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


interface MapItem {
    id: number;
    title: string;
    editable: boolean;
}


const LobbyPage: React.FC = () => {
    const navigate = useNavigate();
    const [maps, setMaps] = useState<MapItem[]>([]);
    const [selectedMap, setSelectedMap] = useState<MapItem | null>(null);
    const [defaultMapId, setDefaultMapId] = useState<number | null>(null);

    // 맵 목록 불러오기 
    const fetchMaps = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get('http://34.64.111.205/maps', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMaps(response.data);

            const defaultMap = response.data.find((map:MapItem) => map.title === '몰캠 주루마블');
            if (defaultMap) {
                setDefaultMapId(defaultMap.id);
            }

        } catch (error) {
            console.error("맵 목록 불러오기 오류:", error);
            alert("맵 목록을 불러오는 데 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 최초 로딩 시 실행
    useEffect(() => {
        fetchMaps();
    }, []);

    // 새 맵 생성
    const handleCreatMap = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate('/login');
            return;
        }
        try {
            const newMap = {
                title: '새 맵 제목',
                tiles: [], // 빈 배열 또는 기본 타일 배열
                is_builtin: false,
            };

            await axios.post('http://34.64.111.205/maps', newMap, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert('맵이 생성되었습니다!');
            fetchMaps(); // 생성 후 다시 리스트 불러오기
        } catch (error) {
            console.error('맵 생성 실패:', error);
            alert('맵 생성 중 오류가 발생했습니다.');
        }
    };

    const handlePreview = (map: MapItem) => {
        setSelectedMap(map);
    };

    const handleClosePopup = () => {
        setSelectedMap(null);
    }

    return (
        <div className="lobby-page">
            <h1 className="lobby-title">맵 리스트</h1>
            <div className="map-container">
                {maps.map((map) => (
                    <div key={map.id} className="map-card">
                        <div className='map-title'>{map.title}</div>
                        <button className="map-preview-button" onClick={() => handlePreview(map)}>맵 미리보기</button>
                        <div className="map-buttons">
                            <button className='map-button' onClick={() => navigate('/game/participant')}>플레이</button>
                            {map.editable && <button className="map-button">수정</button>}
                        </div>
                    </div>
                ))}
        
                <div className="map-card new-map-card" onClick={handleCreatMap}>
                    <div className="plus-icon">+</div>
                    <div className="new-map-text">새 맵 만들기</div>
                </div>
            </div>


            {/* 맵 미리보기 팝업 */}
            {selectedMap && (
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