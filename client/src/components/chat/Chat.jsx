import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

function Chat() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    return <div>Chat Sayfası</div>;
}

export default Chat;
