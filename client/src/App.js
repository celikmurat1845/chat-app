import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login/Login';
import Chat from './components/chat/Chat';

const isUserAuthenticated = () => {
    const token = localStorage.getItem('token');
    // Not: Token geçerliliğini tam olarak kontrol etmek için backend'e bir istek yapmanız gerekebilir
    return token != null;
};

const PrivateRoute = ({ children }) => {
    return isUserAuthenticated() ? children : <Navigate to='/login' replace />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route
                    path='/chat'
                    element={
                        <PrivateRoute>
                            <Chat />
                        </PrivateRoute>
                    }
                />
                <Route path='/' element={<Navigate to='/chat' replace />} />
            </Routes>
        </Router>
    );
}

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired
};

export default App;
