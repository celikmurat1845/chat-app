import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login/Login';
import Chat from './components/chat/Chat';
import { AuthProvider } from './context/authContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path='/login' element={<Login />} />
                    <Route path='/chat' element={<Chat />} />
                    <Route path='/' element={<Navigate to='/chat' replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
