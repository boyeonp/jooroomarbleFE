import React, { useState } from 'react';
import '../styles/ParticipantPage.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';


const ParticipantPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const mapId = location.state?.mapId ?? 1; // 맵 ID를 받아옵니다.

    const [playerCount, setPlayerCount] = useState(4);

    const handleDecrease = () => {
        if (playerCount > 2) setPlayerCount(playerCount - 1);
    };

    const handleIncrease = () => {
        if (playerCount < 20) setPlayerCount(playerCount + 1);
    };

    const handleCreateRoom = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !mapId) {
            alert("로그인이 필요하거나 맵 ID가 없습니다.");
            navigate('/login');
            return;
        }
        try {
            const response = await axios.post("https://api.jooroomarble.store/sessions",
                {
                    mapId,
                    maxPlayers: playerCount,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("세션 생성 응답:", response.data);
            const sessionCode = response.data.joinCode;
            navigate(`/game/waitingroom/${sessionCode}`);
        } catch (error) {
            console.error("대기방 생성 오류:", error);
            alert("대기방 생성에 실패했습니다. 다시 시도해주세요.");
        }
    };


return (
    <div className='participant-container'>
        <h1 className='participant-title'>참여 인원</h1>
        <p className='participant-subtitle'>몰캠 주루마블에 참여할 최대 인원을 설정하세요. </p>

        <div className='counter-wrapper'>
            <button className='counter-btn' onClick={handleDecrease}>-</button>
            <span className='counter-value'>{playerCount}</span>
            <button className='counter-btn' onClick={handleIncrease}>+</button>
        </div>

        <button className='create-room-btn' onClick={handleCreateRoom}>대기방 생성</button>
    </div>
);
};

export default ParticipantPage;
