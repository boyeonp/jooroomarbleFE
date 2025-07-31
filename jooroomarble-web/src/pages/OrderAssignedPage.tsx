import React, { useEffect, useRef, useState } from 'react';
import '../styles/OrderAssignedPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../socket/socket'; // ✅ 공통 소켓 import

interface Participant {
    participantId: number;
    nickname: string;
    joinOrder: number;
}

const OrderAssignedPage: React.FC = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [orderedParticipants, setOrderedParticipants] = useState<Participant[]>([]);

    // ✅ WebSocket 연결 및 game_begin 이벤트 수신
    useEffect(() => {
        if (!code) return;

        if (!socket.connected) {
            socket.connect(); // ✅ 수동 연결
        }

        socket.emit('join_room', { code }); // ✅ join_room은 반드시 호출해야 이벤트 수신 가능
        console.log('🧩 join_room 완료:', code);

        socket.on('connect', () => {
            console.log('✅ WebSocket 연결됨:', socket.id);
        });

        socket.on('game_begin', () => {
            console.log('🚀 game_begin 이벤트 수신됨! -> 보드로 이동');
            navigate(`/game/board/${code}`);
        });

        return () => {
            socket.emit('leave_room', { code });
            socket.off('game_begin');
            socket.off('connect');
        };
    }, [code, navigate]);
    
    useEffect(() => {
        const fetchOrderedParticipants = async () => {
            if (!code) {
                alert("코드가 없습니다.");
                return;
            }
            try {
                const token = localStorage.getItem('accessToken');
                const res = await axios.get(`https://api.jooroomarble.store/sessions/${code}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = res.data;

                //세션이 시작된 상태인 경우만 반영
                if (data.status === "RUN" && data.participants) {
                    // join order 기준 정렬
                    const sorted = [...data.participants].sort((a, b) => a.joinOrder - b.joinOrder);
                    setOrderedParticipants(sorted);
                }
            } catch (error) {
                console.error("순서 배정 정보 가져오기 오류:", error);
                alert("순서 배정 정보를 가져오는 데 실패했습니다.");
            }
        };

        fetchOrderedParticipants();
    }, [code]);

    // 방장: 보드 시작 
    const handleGoToBoard = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !code) {
            alert("로그인이 필요하거나 코드가 없습니다.");
            return;
        }

        try {
            await axios.post(
                `https://api.jooroomarble.store/sessions/${code}/begin`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // 상태 변경 후 보드로 이동
            navigate(`/game/board/${code}`);
        } catch (error: any) {
            console.error("보드판 이동 오류:", error);
            if (error.response?.status === 403) {
                alert("방장만 시작할 수 있습니다.");
            } else {
                alert("보드판 이동 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div className='order-page'>
            <div className='screen-order-title'>순서 배정 완료!</div>
            <div className="circle">
                {orderedParticipants.map((p, index) => (
                    <div
                        key={p.participantId}
                        className="circle-item"
                        style={{ transform: `rotate(${(360 / orderedParticipants.length) * index}deg) translate(0, -200px) rotate(-${(360 / orderedParticipants.length) * index}deg)` }}>
                        <div className="player-number">{index + 1}</div>
                        <div className="player-name">{p.nickname}</div>
                    </div>
                ))}
            </div>

            {/* ✅ 추가된 버튼 */}
            <div className="button-wrapper">
                <button className="start-button" onClick={handleGoToBoard}>보드판으로 이동</button>
            </div>
        </div>
    );
};

export default OrderAssignedPage;