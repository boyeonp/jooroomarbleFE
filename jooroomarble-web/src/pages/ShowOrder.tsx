import React from 'react';
import '../styles/ShowOrder.css';

interface ShowOrderProps {
    order: number;
    nickname: string;
}

const ShowOrder: React.FC<ShowOrderProps> = ({ order, nickname }) => {
    return (
        <div className="show-order-container">
            <h1 className='title'>
                <span className='highlight'>주루마블</span>
                <br /> WEB
            </h1>
            <p className="order-title">순서 배정 완료!</p>
            <div className="order-item">
                <span className="order-number">{order}</span><br/>
                <span className="nickname">{nickname}</span>
            </div>
        </div>
    );
};

export default ShowOrder;
