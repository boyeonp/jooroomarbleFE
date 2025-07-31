import React from 'react';
import '../styles/HomePage.css';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {

    const navigate = useNavigate();
    return (
        <div className='home-page'>
                <div className='title-wrapper'>
                    <div className='main-title'>주루마블</div>
                    <div className='web-text'>WEB</div>
                </div>
                <button className='home-start-button' onClick={() => navigate('/login')}>게임 시작</button>
            </div>
    );
};

export default HomePage;

