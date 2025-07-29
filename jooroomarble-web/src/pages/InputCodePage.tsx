import React, { useState } from 'react';
import '../styles/InputCodePage.css';
import { useNavigate } from 'react-router-dom';

const InputCodePage: React.FC = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!code.trim()) {
      alert("참여할 맵 코드를 입력해주세요.");
      return;
    }

    // 예시로 대기방으로 이동
    navigate(`/game/waitingroom/${code}`);
  };

  return (
    <div className="join-container">
      <h1 className='title'>
        <span className='highlight'>주루마블</span>
        <br /> WEB
      </h1>

      <p className="instruction">참여할 맵 코드를<br />입력하세요.</p>

      <input
        className="name-input"
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="6자리 코드 입력"
        maxLength={6}
      />

      <button className='join-button' onClick={handleJoin}>참여</button>
    </div>
  );
};

export default InputCodePage;