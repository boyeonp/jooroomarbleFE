import React, { useEffect, useState } from 'react';
import '../styles/OrderAssignedPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Participant {
    participantId: number;
    nickname: string;
    joinOrder: number;
}

const OrderAssignedPage: React.FC = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [orderedParticipants, setOrderedParticipants] = useState<Participant[]>([]);

    useEffect(() => {
        const fetchOrderedParticipants = async () => {
            if (!code) {
                alert("코드가 없습니다.");
                return;
            }
            try {
                const token = localStorage.getItem('accessToken');
                const res = await axios.get(`http://34.64.111.205/sessions/${code}`, {
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

    const handleGoToBoard = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !code) {
            alert("로그인이 필요하거나 코드가 없습니다.");
            return;
        }

        try {
            await axios.post(
                `http://34.64.111.205/sessions/${code}/begin`,
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
            <div className='order-title'>순서 배정 완료!</div>
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