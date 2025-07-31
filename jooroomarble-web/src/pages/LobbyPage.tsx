import React, { useEffect, useState } from 'react';
import '../styles/LobbyPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import previewImage from '../assets/jooroomarble.png'; // ✅ 이미지 import

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
  const [loading, setLoading] = useState(true);

  const fetchMaps = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://34.64.111.205/maps', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMaps(response.data);
      const defaultMap = response.data.find((map: MapItem) => map.title === '몰캠 주루마블');
      if (defaultMap) setDefaultMapId(defaultMap.id);
      setLoading(false);
    } catch (error) {
      console.error("맵 목록 불러오기 오류:", error);
      alert("맵 목록을 불러오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  const handleCreateMap = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }

    try {
      const newMap = {
        title: '새 맵 제목',
        tiles: [],
        is_builtin: false,
      };

      await axios.post('http://34.64.111.205/maps', newMap, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('맵이 생성되었습니다!');
      fetchMaps();
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
  };

  return (
    <div className="lobby-page">
      <h1 className="lobby-title">맵 리스트</h1>

      {loading ? (
        <div className="loading-text">맵 목록 불러오는 중...</div>
      ) : (
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

          <div className="map-card new-map-card" onClick={handleCreateMap}>
            <div className="plus-icon">+</div>
            <div className="new-map-text">새 맵 만들기</div>
          </div>
        </div>
      )}

      {/* ✅ 맵 미리보기 팝업 */}
      {selectedMap && (
        <div className="popup-overlay" onClick={handleClosePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedMap.title}</h2>
            <div className="map-image-placeholder">
              {selectedMap.title === '몰캠 주루마블' ? (
                <img src={previewImage} alt="맵 미리보기" className="map-preview-image" />
              ) : (
                <p>미리보기 이미지가 준비되지 않았습니다.</p>
              )}
            </div>
            <button onClick={handleClosePopup} className="close-button">닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LobbyPage;
