import React, { useMemo } from 'react';
import '../styles/OrderAssignedPage.css';

const originalPlayers=[
    '진짜 김병주', '가짜 김병주','저건뭘까요','김병주 맞나',
    '이건','누구냐','빙수','이건뭐게요',
    '저건','그건','김병주 클론',
];

// Fisher-Yates Shuffle 알고리즘 
const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length -1; i > 0; i--){
        const j = Math.floor(Math.random() * (i+1));
        [shuffled[i],shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};



const OrderAssignedPage: React.FC = () => {
    // useMemo로 재랜더링 시에도 초기 한번만 섞이도록 고정 
    const shuffledPlayers = useMemo(() => shuffleArray(originalPlayers), []);

    return (
        <div className='order-page'>
            <div className='order-title'>순서 배정 완료!</div>
            <div className="circle">
                {shuffledPlayers.map((name, index) => (
                    <div 
                    key={index} 
                    className="circle-item" 
                    style={{transform: `rotate(${(360/shuffledPlayers.length) * index}deg) translate(0, -200px) rotate(-${(360/shuffledPlayers.length)*index}deg)`}}>
                        <div className="player-number">{index+1}</div>
                        <div className="player-name">{name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderAssignedPage;