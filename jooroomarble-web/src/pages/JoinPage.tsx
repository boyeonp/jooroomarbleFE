import React, { useState } from 'react';
import '../styles/JoinPage.css';

const JoinPage: React.FC = () => {
    const [name, setName] = useState('');
    const [showWarning, setShowWarning] = useState(false);

    const handleJoin = () => {
        if (!name.trim()) {
            alert("이름을 입력해주세요.");
            return;
        }

        // 참여 로직 구현
        setShowWarning(true);
    };

    return (
        <div className="join-container">
            <h1 className='title'>
                <span className='highlight'>주루마블</span>
                <br /> WEB
            </h1>
            <p className="instruction">
                <span className="blue">몰캠 주루마블</span>에<br />
                참여를 원하시면, <br />
                <span className="yellow">이름</span>을 입력하세요.
            </p>

            <input
                className="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요" />
            <p className='sub-text'>소주만 마시는 거에 동의합니다.</p>
            <button className='join-button' onClick={handleJoin}>참여</button>
            {showWarning && (
                <p className='warning'>
                    참여가 확정되었습니다. <br />
                    방장이 게임 시작을 할 때까지 잠시만 기다려주세요.
                </p>
            )}        
            </div>
    );
};

export default JoinPage;