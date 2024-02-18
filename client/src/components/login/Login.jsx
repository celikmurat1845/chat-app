import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';

function Login() {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username) {
            try {
                const response = await axios.post('http://localhost:8000/api/v1/auth/login', {
                    username
                });

                console.log(response.data.data.token);

                localStorage.setItem('token', response.data.data.token);
                navigate('/chat');
            } catch (error) {
                console.error('Login error:', error);
            }
        }
    };

    return (
        <div className={styles.loginContainer}>
            <h2 className={styles.title}>Welcome to Chat-App</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type='text'
                    placeholder='Username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={styles.input}
                />
                <button type='submit' className={styles.button}>
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;
