import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LobbyPage from './pages/LobbyPage';
import WaitingRoomPage from './pages/WaitingRoom';
import OrderAssignedPage from './pages/OrderAssignedPage';
import Board from './pages/BoardPage';

function App(){
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/lobby" element={<LobbyPage/>}/>
        <Route path="/game/waitingroom" element={<WaitingRoomPage/>}/>
        <Route path="/game/orderassigned" element={<OrderAssignedPage/>}/>
        <Route path="/game/board" element={<Board/>}/>
      </Routes>
    </Router>
  )
}

export default App;