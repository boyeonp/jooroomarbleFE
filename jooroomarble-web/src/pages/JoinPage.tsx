import React, { useEffect, useState } from 'react';
import '../styles/JoinPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket/socket'; // ✅ 공통 소켓 import


const JoinPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  // 닉네임 중복 체크 함수
  const checkNicknameDuplicate = async (sessionCode: string, nickname: string) => {
    try {
      const res = await axios.get(`https://api.jooroomarble.store/sessions/${sessionCode}`);
      const participants = res.data?.participants || [];
      console.log('참가자 목록:', participants);
      return participants.some((p: any) => p.nickname === nickname);
    } catch (err) {
      console.error('닉네임 중복 확인 실패:', err);
      return false;
    }
  }

  // ✅ WebSocket 연결 및 game_start 수신
  useEffect(() => {
    if (!showWarning) return;

    const joinCode = localStorage.getItem('joinCode');
    const myNickname = localStorage.getItem('nickname');
    if (!joinCode || !myNickname) return;

    // ✅ 공통 소켓 연결
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_room', { code: joinCode });
    console.log('🧩 join_room emit 완료:', joinCode);

    socket.on('connect', () => {
      console.log('✅ WebSocket 연결됨:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ WebSocket 연결 실패:', err);
    });

    socket.on('game_start', async () => {
      console.log('game_start 이벤트 수신됨 ')
      try {
        const res = await axios.get(`https://api.jooroomarble.store/sessions/${joinCode}`);
        const data = res.data;

        const myInfo = data.participants.find((p: any) => p.nickname === myNickname);
        if (myInfo) {
          // ✅ 추가: 나의 joinOrder와 전체 인원 수 저장
          localStorage.setItem('joinOrder', String(myInfo.joinOrder));
          localStorage.setItem('totalPlayers', String(data.participants.length));

          navigate('/game/showorder', {
            state: {
              order: myInfo.joinOrder + 1,
              nickname: myInfo.nickname,
              code: joinCode,
            },
          });
        }
      } catch (err) {
        console.error('게임 시작 후 내 정보 불러오기 오류:', err);
      }
    });

    //   const interval = setInterval(async () => {
    //     try {
    //       const joinCode = localStorage.getItem('joinCode');
    //       const myNickname = localStorage.getItem('nickname');
    //       if (!joinCode || !myNickname) return;

    //       const res = await axios.get(`https://api.jooroomarble.store/sessions/${joinCode}`);
    //       const data = res.data;

    //       // 🔍 닉네임으로 내 정보 찾기
    //       const myInfo = data.participants.find((p: any) => p.nickname === myNickname);

    //       console.log('🔵 전체 참여자 목록:', data.participants);
    //       console.log('🟢 내 닉네임:', myNickname);
    //       console.log('🟢 내 정보:', myInfo);

    //       if (data.status === 'RUN' && myInfo) {
    //         navigate('/game/showorder', {
    //           state: {
    //             order: myInfo.joinOrder + 1,
    //             nickname: myInfo.nickname,
    //             code: joinCode, // ✅ 여기 추가!!

    //           },
    //         });
    //       }
    //     } catch (err) {
    //       console.error('게임 시작 감지 중 오류:', err);
    //     }
    //   }, 3000);

    return () => {
      socket.emit('leave_room', { code: joinCode });
      socket.disconnect();
    };
  }, [showWarning, navigate]);


  // 세션 참여 요청 
  const handleJoin = async () => {
    if (!nickname.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!code.trim()) {
      alert('참여 코드를 입력해주세요.');
      return;
    }

    // 닉네임 중복 체크
    const isDuplicate = await checkNicknameDuplicate(code, nickname);
    console.log('닉네임중복체크:', isDuplicate);
    if (isDuplicate) {
      alert('이미 사용 중인 닉네임입니다. 다른 이름을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post(`https://api.jooroomarble.store/sessions/${code}/join`, {
        nickname,
      });

      const { guestId, participantId } = response.data;

      // 백엔드에서 guestId가 오더라도 사용하지 않음
      localStorage.setItem('joinCode', code);
      localStorage.setItem('nickname', nickname);
      console.log('guestId:', guestId);
      console.log('participantId:', participantId);
      localStorage.setItem('guestId', guestId);
      localStorage.setItem('participantId', participantId);

      setShowWarning(true);
    } catch (error: any) {
      console.error('참여 실패:', error);
      if (error.response?.status === 403) {
        alert('이미 인원이 가득 찼습니다. 다른 방을 이용해주세요.');
      } else {
        alert('참여에 실패했습니다. 코드를 확인해주세요.');
      }
    }
  };

  return (
    <div className="join-container">
      <h1 className="title">
        <span className="highlight">주루마블</span>
        <br /> WEB
      </h1>
      <p className="instruction">
        <span className="blue">몰캠 주루마블</span>에
        <br />
        참여를 원하시면, <br />
        <span className="yellow">참여코드와 이름</span>을 <br/> 입력하세요.
      </p>
      <input
        className="name-input"
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="참여코드 (6자리)"
        maxLength={6}
      />
      <input
        className="name-input"
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="닉네임 입력"
      />
      <p className="sub-text">소주만 마시는 거에 동의합니다.</p>
      <button className="join-button" onClick={handleJoin}>
        참여
      </button>
      {showWarning && (
        <p className="warning">
          참여가 확정되었습니다. <br />
          방장이 게임 시작을 할 때까지 잠시만 기다려주세요.
        </p>
      )}
    </div>
  );
};

export default JoinPage;
