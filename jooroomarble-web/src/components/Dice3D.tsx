import React, { useEffect, useRef } from 'react';
import '../styles/Dice3D.css';

interface Dice3DProps {
    number: number;    // 1~6
    rolling: boolean;  // true면 주사위 굴러가는 애니메이션
    onRollEnd?: () => void;     // ✅ 주사위 굴림 완료 시 실행할 콜백

}

const Dice3D: React.FC<Dice3DProps> = ({ number, rolling, onRollEnd}) => {
    const cubeRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (cubeRef.current) {
            const cube = cubeRef.current;
            cube.className = `cube`; // 기존 클래스 초기화
            cube.classList.add(`show-${number}`); // 현재 숫자에 해당하는 클래스 추가

            if (rolling) {
                cube.classList.remove('rolling');
                void cube.offsetWidth; // reflow
                cube.classList.add('rolling'); // 애니메이션 시작

                // ✅ 애니메이션 끝난 후 콜백 실행 (1.5초 후)
                const timeout = setTimeout(() => {
                    if (onRollEnd) onRollEnd();
                }, 1000);

                return () => clearTimeout(timeout);
            }
        }
    }, [number, rolling, onRollEnd]);


    return (
        <div className="dice-container">
            <div ref={cubeRef} className={`cube show-${number}`}>
                <div className="face front face-1">
                    <span className="dot"></span>
                </div>
                <div className="face back face-6">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
                <div className="face right face-3">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
                <div className="face left face-4">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
                <div className="face top face-5">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
                <div className="face bottom face-2">
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
            </div>
        </div>
    );
};

export default Dice3D;
