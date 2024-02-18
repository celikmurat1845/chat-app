// Örneğin, src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login/Login';

function App() {
    return (
        <Router>
            <Routes>
                <Route
                    path='/login'
                    element={<Login onLogin={(username) => console.log(username)} />}
                />
            </Routes>
        </Router>
    );
}

export default App;
