import React, { useState } from 'react';
import '../styles/SignupPage.css';

const SignupPage: React.FC = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log("회원가입 정보: ", {userId, password, nickname});
    };

  return (
    <div className="auth-page">
      <h1 className="auth-title">회원가입</h1>

      <form className="form-group" onSubmit={handleSubmit}>
        <label className="input-text">아이디</label>
        <input
          type="text"
          value={userId}
          placeholder='아이디를 입력하세요'
          onChange={(e) => setUserId(e.target.value)}
          required
        />

        <label className="input-text">비밀번호</label>
        <input
          type="password"
          value={password}
          placeholder='비밀번호를 입력하세요'
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="input-text">닉네임</label>
        <input
          type="text"
          value={nickname}
          placeholder='닉네임을 입력하세요'
          onChange={(e) => setNickname(e.target.value)}
          required
        />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="submit" className="submit-button">완료</button>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;