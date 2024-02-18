// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';

// const socket = io('http://localhost:8000'); // Sunucunuzun çalıştığı adrese göre değiştirin

// function Chat() {
//     const [message, setMessage] = useState('');
//     const [messages, setMessages] = useState([]);

//     useEffect(() => {
//         socket.on('chat message', (msg) => {
//             setMessages((messages) => [...messages, msg]);
//         });
//     }, []);

//     const sendMessage = (e) => {
//         e.preventDefault();
//         if (message) {
//             socket.emit('chat message', message);
//             setMessage('');
//         }
//     };

//     return (
//         <div>
//             <ul>
//                 {messages.map((msg, index) => (
//                     <li key={index}>{msg}</li>
//                 ))}
//             </ul>
//             <form onSubmit={sendMessage}>
//                 <input type='text' value={message} onChange={(e) => setMessage(e.target.value)} />
//                 <button type='submit'>Send</button>
//             </form>
//         </div>
//     );
// }

// export default Chat;
