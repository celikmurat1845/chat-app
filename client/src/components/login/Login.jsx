import React, { useState } from 'react';
import PropTypes from 'prop-types'; // PropTypes'ı import edin
import styles from './Login.module.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username) {
            onLogin(username);
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
};

// Burada onLogin prop'unun tipini ve zorunluluğunu tanımlayın
Login.propTypes = {
    onLogin: PropTypes.func.isRequired
};

export default Login;
