import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LobbyPage from './pages/LobbyPage';
import WaitingRoomPage from './pages/WaitingRoom';
import OrderAssignedPage from './pages/OrderAssignedPage';
import Board from './pages/BoardPage';
import JoinPage from './pages/JoinPage';
import RollDicePage from './pages/RollDicePage';
import ParticipantPage from './pages/ParticipantPage';
import ShowOrderWrapper from './pages/ShowOrderWrapper';

function App(){
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/lobby" element={<LobbyPage/>}/>
        <Route path="/game/waitingroom/:code" element={<WaitingRoomPage/>}/>
        <Route path="/game/orderassigned/:code" element={<OrderAssignedPage/>}/>
        <Route path="/game/board/:code" element={<Board/>}/>
        <Route path="/game/join" element={<JoinPage/>}/>
        <Route path="/game/showorder" element={<ShowOrderWrapper/>}/>
        <Route path="/game/rolldice/:code" element={<RollDicePage/>}/>
        <Route path="/game/participant" element={<ParticipantPage/>}/>

      </Routes>
    </Router>
  )
}

export default App;