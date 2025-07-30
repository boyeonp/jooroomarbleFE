import React, { useEffect, useState } from 'react';
import '../styles/WaitingRoom.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../socket/socket';

interface Guest {
    id: number;
    nickname: string;
    guestId?: string;
}


const WaitingRoomPage: React.FC = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [participants, setParticipants] = useState<Guest[]>([]);
    const [guestId, setGuestId] = useState<string | null>(null);

    // ✅ WebSocket 초기 연결 및 이벤트 바인딩
    useEffect(() => {
        if (!code) {
            alert("대기실 코드가 없습니다.");
            navigate('/lobby');
            return;
        }

        const token = localStorage.getItem('accessToken');
        const localGuestId = localStorage.getItem('guestId');
        setGuestId(localGuestId);

        if (!token) {
            alert("로그인이 필요합니다.");
            navigate('/login');
            return;
        }

        if (!socket.connected) socket.connect();


        socket.emit('join_room', { code });

        // ✅ 서버로부터 실시간 유저 입장 수신
        socket.on('guest_joined', (data: any) => {
            console.log('🟢 새로운 유저 입장:', data);
            fetchSession(); // 갱신
        });

        // ✅ 게임 시작 감지 시 이동
        socket.on('game_start', () => {
            console.log('🟢 서버로부터 game_started 수신!');
            navigate(`/game/orderassigned/${code}`);
        });

        // 🔄 최초 한 번 상태 로드
        fetchSession();

        // 🧼 언마운트 시 leave_room
        return () => {
            socket.emit('leave_room', { code });
            socket.disconnect();
        };
    }, [code, navigate]);

    // ✅ 세션 정보 수동 조회
    const fetchSession = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
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

            if (data.status === 'RUN' && guestId) {
                const myInfo = data.participants.find((p: any) => String(p.guestId) === guestId);
                if (myInfo) {
                    navigate('/game/showorder', {
                        state: {
                            order: myInfo.joinOrder + 1,
                            nickname: myInfo.nickname,
                        },
                    });
                }
            }
        } catch (error) {
            console.error('세션 정보 불러오기 오류:', error);
        }
    };

    // ✅ 방장: 게임 시작 요청
    const handleStartGame = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !code) {
            alert("게임을 시작할 수 없습니다.");
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
            // 나머지 인원도 socket.on('game_started')로 이동

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
                    참여코드 <span className="join-code">{code}</span>
                </div>
                <div className="participant-list">
                    <div className="participant-count">참여자 ({participants.length}명)</div>
                    <div className="participant-scroll">
                        <ul>
                            {participants.map((p) => (
                                <li key={p.id}>{p.nickname}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="button-wrapper">
                <button className="start-button" onClick={handleStartGame}>GAME START</button>
            </div>
        </div>
    );
};

export default WaitingRoomPage;
