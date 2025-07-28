import React from 'react';
import '../styles/WaitingRoom.css';
import qrImage from '../assets/qrcode.svg';
import { useNavigate } from 'react-router-dom';


const WaitingRoomPage: React.FC = () => {
    const participants = [
        '진짜 김병주', '가짜 김병주','저건뭘까요','김병주 맞나',
        '이건','누구냐','빙수','이건뭐게요',
        '저건','그건','김병주 클론',
    ];

    const navigate = useNavigate();
    return (
        <div className="waiting-room">
            <h1 className="waiting-title">대기실</h1>
            <div className="content-wrapper">
                <img src={qrImage} alt='QR Code' className='qr-code'/>
                <div className="participant-list">
                    <div className='participant-count'>참여자 ({participants.length}명)</div>
                    <div className="participant-scroll">
                        <ul>
                            {participants.map((name, index) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className='button-wrapper'>
                <button className='start-button' onClick={() => navigate('/game/orderassigned') }>GAME START</button>
            </div>
        </div>
    );
};

export default WaitingRoomPage;