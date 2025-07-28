import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId || !password){
            alert("아이디와 비밀번호를 모두 입력해주세요.");
            return;
        }

        console.log("로그인 시도:", { userId, password });
        alert("로그인 성공");
        navigate('/lobby'); // 로그인 성공 후 이동
    };

    return (
        <div className='auth-page'>
            <h1 className='auth-title'>로그인</h1>
            <form onSubmit={handleSubmit} className='form-group'>
                <div className="input-text">아이디</div>
                <input
                    type="text"
                    placeholder='아이디를 입력하세요'
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />
                <div className="input-text">비밀번호</div>
                <input 
                    type = "password"
                    placeholder='비밀번호를 입력하세요'
                    value = {password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <button type="submit" className='submit-button'>완료</button>    
                </div>
            </form> 
            <p className='link-text'>
                아직 계정이 없으신가요? {' '}
                <span className='signup-link' onClick={() => navigate('/signup')}>회원가입</span>
            </p>
        </div>
    );
};

export default LoginPage;