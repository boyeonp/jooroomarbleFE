import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import axios from 'axios';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password){
            alert("이메일과 비밀번호를 모두 입력해주세요.");
            return;
        }

        try {
            const response = await axios.post('http://34.64.111.205/auth/login', { email, password });
            const {accessToken} = response.data;
            localStorage.setItem('accessToken', accessToken);
            alert("로그인 성공");
            navigate('/lobby');
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                alert("이메일 또는 비밀번호가 잘못되었습니다.");
            } else {
                alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
                console.error("로그인 오류:", error);
            }
        }
    };

    return (
        <div className='auth-page'>
            <h1 className='auth-title'>로그인</h1>
            <form onSubmit={handleSubmit} className='form-group'>
                <div className="input-text">이메일</div>
                <input
                    type="text"
                    placeholder='이메일을 입력하세요'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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