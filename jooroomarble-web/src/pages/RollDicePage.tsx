import React, { useState } from 'react';
import Dice3D from '../components/Dice3D';
import Popup from '../components/Popup';
import '../styles/RollDicePage.css';

const RollDicePage: React.FC = () => {
  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleRoll = () => {
    if (rolling) return;

    const roll = Math.floor(Math.random() * 6) + 1;
    setRolling(true);

    setTimeout(() => {
      setDiceValue(roll);
      setRolling(false);

      setTimeout(() => {
        setShowPopup(true); // 주사위 결과 팝업 표시
      }, 1000);
    }, 1000);
  };

  return (
    <div className="roll-page-container">
      <h1 className="dice-title">
        <span className="highlight">주루마블</span>
        <br /> WEB
      </h1>
      <p className="instruction">
        본인 차례가 되었습니다. <br />
        <span className="dice-keyword">주사위</span>를 던져 주세요 !!
      </p>

      <div className="dice-wrapper">
        <Dice3D number={diceValue} rolling={rolling} />
      </div>

      <button className="dice-button" onClick={handleRoll}>
        주사위 던지기
      </button>

      {showPopup && (
        <Popup
          title={`🎲 주사위 결과: ${diceValue}`}
          description={`${diceValue}칸 이동하세요!`}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default RollDicePage;
