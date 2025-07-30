// src/pages/ShowOrderWrapper.tsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ShowOrder from './ShowOrder';
import axios from 'axios';

const ShowOrderWrapper: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { order?: number, nickname?: string, code?: string } | undefined;

    useEffect(() => {
        const code = state?.code;

        if (!code || !state || typeof state.order !== 'number' || !state.nickname) {
            console.log("무슨 문제가 여기서 발생함");
            navigate('/lobby');
            return;
        }

        const checkGameStatus = async () => {
            try {
                const response = await axios.get(`http://34.64.111.205/sessions/${code}`);

                if (response.data.status === 'PLAYING') {
                    navigate(`/game/rolldice/${code}`);
                }
            } catch (error) {
                console.error("게임 상태 확인 중 오류 발생:", error);
                navigate('/lobby');
            }
        };

        const intervalId = setInterval(checkGameStatus, 2000);

        return () => clearInterval(intervalId);
    }, [state, navigate]);

    if (!state || typeof state.order !== 'number' || !state.nickname) {
        return null; // Or a loading indicator
    }

    return <ShowOrder order={state.order} nickname={state.nickname} />;
};

export default ShowOrderWrapper;
