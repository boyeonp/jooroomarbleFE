import React, { useState } from 'react';
import '../styles/SignupPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      console.log("보내는 값:", { email, password, nickname });

    try {
      const response = await axios.post('http://34.64.111.205/auth/signup', { email, password, nickname });


      alert("회원가입 성공");   
      navigate('/login');
    } catch (error: any) {
      if (error.response.status === 400) {
        alert("이미 사용 중인 이메일입니다.");
      } else {
        alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
        console.error("회원가입 오류:", error);
      }
    }
  };

  return (
    <div className="auth-page">
      <h1 className="auth-title">회원가입</h1>

      <form className="form-group" onSubmit={handleSubmit}>
        <label className="input-text">이메일</label>
        <input
          type="text"
          value={email}
          placeholder='아이디를 입력하세요'
          onChange={(e) => setEmail(e.target.value)}
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