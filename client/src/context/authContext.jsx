import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                await axios.get('http://localhost:8000/api/v1/auth/verify-token', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error verifying token:', error);
                setIsAuthenticated(false);
            }
        };

        verifyToken();
    }, []);

    return <AuthContext.Provider value={{ isAuthenticated }}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};
