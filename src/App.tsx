import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import AuthPage from './pages/Auth';


function App() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/home');
  };

  return (
    <Routes>
      <Route path="/" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
