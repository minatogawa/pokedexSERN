import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Pokedex from './pages/Pokedex';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/pokedex"
            element={
              <ProtectedRoute>
                <Pokedex />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/pokedex" replace />} />
          <Route path="*" element={<Navigate to="/pokedex" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
