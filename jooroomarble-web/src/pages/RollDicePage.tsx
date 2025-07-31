import React, { useState, useEffect } from 'react';
import Dice3D from '../components/Dice3D';
import Popup from '../components/Popup';
import '../styles/RollDicePage.css';
import { useParams } from 'react-router-dom';
import { socket } from '../socket/socket';
import axios from 'axios';

const RollDicePage: React.FC = () => {
  const { code } = useParams();
  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState<boolean | null>(null);
  const [popupText, setPopupText] = useState('');

  const token = localStorage.getItem('accessToken');
  const guestId = localStorage.getItem('guestId');
  const joinOrder = Number(localStorage.getItem('joinOrder'));
  const totalPlayers = Number(localStorage.getItem('totalPlayers'));

  const checkInitialTurn = async () => {
    try {
      const res = await axios.get(`https://api.jooroomarble.store/sessions/${code}`);
      const data = res.data;

      if (data.status === 'PLAYING' && joinOrder === 0) {
        console.log('🟢 첫 턴 유저로 판단됨');
        setIsMyTurn(true);
      }
    } catch (e) {
      console.warn('첫 턴 상태 확인 실패:', e);
    }
  };

  useEffect(() => {
    if (!code || isNaN(joinOrder) || isNaN(totalPlayers)) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_room', { code });

    socket.on('connect', () => {
      console.log('🧩 WebSocket 연결 성공');
    });

    socket.on('game_begin', () => {
      if (joinOrder === 0) {
        setIsMyTurn(true);
      }
    });

    socket.on('turn_changed', (data: any) => {
      console.log('📥 turn_changed 수신:', data);

      const currentTurnNo = data.turnNo;
      const myTurn = currentTurnNo % totalPlayers === joinOrder;

      console.log(`turnNo: ${currentTurnNo}, joinOrder: ${joinOrder} → 내 턴? ${myTurn}`);
      setIsMyTurn(myTurn);

      // ❌ 팝업이나 주사위 결과는 여기서 처리하지 않는다
    });

    checkInitialTurn();

    return () => {
      socket.emit('leave_room', { code });
      socket.disconnect();
    };
  }, [code, joinOrder, totalPlayers]);

  const handleRoll = async () => {
    if (rolling || !isMyTurn || !code || !guestId) return;

    setRolling(true);
    try {
      const res = await axios.post(
        `https://api.jooroomarble.store/sessions/${code}/turn`,
        { guestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ 내 차례일 때 주사위 값 직접 처리
      const { dice, tile } = res.data;
      setDiceValue(dice);
      setPopupText(
        `📍 ${tile.description || '도착한 칸'}\n\n ${tile.defaultAction?.message || ''}`
      );
      setShowPopup(true);
      setRolling(false);
    } catch (err: any) {
      console.error('🎲 주사위 굴리기 실패:', err);
      alert(err?.response?.data?.message || '주사위 굴리기에 실패했습니다.');
      setRolling(false);
    }
  };

  return (
    <div className="roll-page-container">
      {!isMyTurn && (
        <div className="blur-overlay">
          아직 본인 차례가 아닙니다.
          <br />잠시만 기다려주세요.
        </div>
      )}

      <h1 className="dice-title">
        <span className="highlight">주루마블</span>
        <br /> WEB
      </h1>

      <p className="instruction">
        본인 차례가 되었습니다.
        <br />
        <span className="dice-keyword">주사위</span>를 던져 주세요 !!
      </p>

      <div className="dice-wrapper">
        <Dice3D number={diceValue} rolling={rolling} />
      </div>

      <button
        className="dice-button"
        onClick={handleRoll}
        disabled={!isMyTurn || rolling}
      >
        주사위 던지기
      </button>

      {showPopup && (
        <Popup
          title={`🎲 주사위 결과: ${diceValue}`}
          description={popupText}
          onClose={() => setShowPopup(false)}
          variant='roll'
        />
      )}
    </div>
  );
};

export default RollDicePage;
