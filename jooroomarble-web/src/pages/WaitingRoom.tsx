import React, { useEffect, useState } from 'react';
import '../styles/WaitingRoom.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface Guest {
    id: number;
    nickname: string;
    guestId?: string; // 추가 (혹시나 백엔드에서 없는 경우 대비)
}

const WaitingRoomPage: React.FC = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [participants, setParticipants] = useState<Guest[]>([]);

    useEffect(() => {
        if (!code) {
            alert("대기실 코드가 없습니다.");
            navigate('/lobby');
            return;
        }

        const fetchSession = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const guestId = localStorage.getItem('guestId');

                if (!token) {
                    alert("로그인이 필요합니다.");
                    navigate('/login');
                    return;
                }

                const res = await axios.get(`http://34.64.111.205/sessions/${code}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = res.data;
                setParticipants(data.participants || []);

                console.log("🟡 세션 상태:", data.status);
                console.log("🟡 내 guestId:", guestId);
                console.log("🟡 참여자 목록:", data.participants);

                // 게스트일 경우 게임 시작 시 자동 이동
                if (data.status === "RUN" && guestId) {
                    const myInfo = data.participants.find((p: any) => String(p.guestId) === guestId);
                    console.log("🟢 내 정보:", myInfo);
                    if (myInfo) {
                        console.log("✅ 게임 시작 감지됨 → ShowOrder로 이동");
                        navigate('/game/showorder', {
                            state: {
                                order: myInfo.joinOrder + 1,
                                nickname: myInfo.nickname,
                            },
                        });
                    }
                }
            } catch (error) {
                console.error("세션 정보 불러오기 오류:", error);
            }
        };

        fetchSession();
        const interval = setInterval(fetchSession, 1000); // 3초마다 대기실 정보 갱신
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
            navigate(`/game/orderassigned/${code}`);
        } catch (error: any) {
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
