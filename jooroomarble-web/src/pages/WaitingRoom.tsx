import React, { useEffect, useState } from 'react';
import '../styles/WaitingRoom.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface Guest {
    id: number;
    nickname: string;
}

interface JwtPayload {
    id: number;
    email: string;
}

const WaitingRoomPage: React.FC = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [participants, setParticipants] = useState<Guest[]>([]);
    const [isHost, setIsHost] = useState(false);

    useEffect(() => {
        if (!code) {
            alert("대기실 코드가 없습니다.");
            navigate('/lobby');
            return;
        }
        const fetchSession = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    return;
                }

                const decoded = jwtDecode(token!);

                const res = await axios.get(`http://34.64.111.205/sessions/${code}`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("세션 정보", res.data);
                setParticipants(res.data.guests || []);

                if (res.data.hostId && decoded.id) {
                    setIsHost(res.data.hostId === decoded.id);
                }
            } catch (error) {
                console.error("세션 정보 불러오기 오류:", error);
            }
        };

        fetchSession();
        const interval = setInterval(fetchSession, 3000); // 5초마다 대기실 정보 갱신
        return () => clearInterval(interval);
    }, [code, navigate]);


    // 게임 시작 요청
    const handleStartGame = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !code) {
            alert("게임을 시작할 수 없습니다. 로그인 상태를 확인해주세요.");
            navigate('/login');
            return;
        }

        try {
            const res = await axios.post(
                `http://34.64.111.205/sessions/${code}/start`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("게임 시작 응답: ", res.data);
            navigate('/game/orderassigned');
        } catch(error: any){
            console.error("게임 시작 오류:", error);
            if (error.response?.status === 403) {
                alert("방장만 게임을 시작할 수 있습니다.");
            } else if (error.response?.status === 401) {
                alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
                navigate('/login');
            } else {
                alert("게임 시작에 실패했습니다.");
            }
        }
    };

    return (
        <div className="waiting-room">
            <h1 className="waiting-title">대기실</h1>


            <div className="content-wrapper">
                <div className="join-code-box">
                    참여코드: <span className="join-code">{code}</span>
                </div>
                <div className="participant-list">
                    <div className='participant-count'>참여자 ({participants.length}명)</div>
                    <div className="participant-scroll">
                        <ul>
                            {participants.map((p) => (
                                <li key={p.id}>{p.nickname}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className='button-wrapper'>
                <button className='start-button' onClick={handleStartGame}>GAME START</button>
            </div>
        </div>
    );
};

export default WaitingRoomPage;