import React, { useEffect, useState } from 'react';
import '../styles/JoinPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JoinPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  // 게임 시작 감지
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(async () => {
      try {
        const joinCode = localStorage.getItem('joinCode');
        const myNickname = localStorage.getItem('nickname');
        if (!joinCode || !myNickname) return;

        const res = await axios.get(`http://34.64.111.205/sessions/${joinCode}`);
        const data = res.data;

        // 🔍 닉네임으로 내 정보 찾기
        const myInfo = data.participants.find((p: any) => p.nickname === myNickname);

        console.log('🔵 전체 참여자 목록:', data.participants);
        console.log('🟢 내 닉네임:', myNickname);
        console.log('🟢 내 정보:', myInfo);

        if (data.status === 'RUN' && myInfo) {
          navigate('/game/showorder', {
            state: {
              order: myInfo.joinOrder + 1,
              nickname: myInfo.nickname,
              code: joinCode, // ✅ 여기 추가!!

            },
          });
        }
      } catch (err) {
        console.error('게임 시작 감지 중 오류:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [showWarning, navigate]);

  const handleJoin = async () => {
    if (!nickname.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!code.trim()) {
      alert('참여 코드를 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post(`http://34.64.111.205/sessions/${code}/join`, {
        nickname,
      });

      // 백엔드에서 guestId가 오더라도 사용하지 않음
      localStorage.setItem('joinCode', code);
      localStorage.setItem('nickname', nickname);
      setShowWarning(true);
    } catch (error: any) {
      console.error('참여 실패:', error);
      alert('참여에 실패했습니다. 코드를 확인해주세요.');
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
        <span className="yellow">참여코드와 이름</span>을 입력하세요.
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
