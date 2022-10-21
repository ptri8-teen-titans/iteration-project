import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@mui/material';
import { io } from 'socket.io-client';
import { useCookies } from 'react-cookie';
import jwt_decode from 'jwt-decode';

const socket = io('http://localhost:3000');

function Chatbox(props) {
  const { messageHistory, setMessageHistory } = props;
  console.log('messageHistory -->', messageHistory);

  //Room State
  //const [room, setRoom] = useState("");

  const [cookies, setCookie] = useCookies();

  const [username, setUsername] = useState('');

  const [message, setMessage] = useState('');
  const [messageReceived, setMessageReceived] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);

  // message history is array of objects consisting of message body property and received which is boolean to
  // indicate if message was received or sent
  // const [messageHistory, setMessageHistory] = useState([]);
  console.log('props', props);

  // anchoring last message in chatbox
  const last = useRef(null);

  const sendMessage = () => {
    // emit event to server
    // console.log('msgObj roomId -->', cookies.roomId)
    const messageObj = { message, room: props.room, user: username };
    socket.emit('send_message', messageObj);

    // append message object as sent message to messageHistory for rendering
    setMessageHistory((state) => {
      const newHistory = [...state, messageObj];
      return newHistory;
    });

    // append message object as document in chat collection
    addMessage(messageObj);
  };

  const addMessage = async (messageObj) => {
    console.log('inside chatbox addMessage helper fx');
    console.log('messageObj --> ', messageObj);
    const messages = await fetch('/api/rooms/chats', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(messageObj),
    });

    const response = await messages.json();
    console.log('addMessage response --> ', response);
  };

  // separate useEffect to join room chat on component render
  useEffect(() => {
    console.log('chatbox useeffect');
    // get the user info off jwt cookie
    const decoded = jwt_decode(cookies.ssid);
    setUsername(decoded.username);
    socket.emit('join_room', props.room);
  }, []);

  // useEffect listening to socket events containing socket listener for received messeages events to append to message history
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessageHistory((state) => {
        const newHistory = [...state, data];
        return newHistory;
      });
    });
  }, [socket]);

  // useEffect to append room chat to latest message
  useEffect(() => {
    last.current?.scrollIntoView({ behavior: 'smooth' });
  });
  
  const messages = messageHistory.map((e, i) => {
    console.log('messages e --> ', e);

    // const userName = await fetch(`/api/users/${e.user}`);
    // const userNameClean = await userName.json();
    
    // if (e.user === username) {
      const rightStyle = {
        color: '#1976d2',
        textAlign: 'right',
        backgroundColor: '#ededed',
        padding: '8px',
        marginBottom: '5px',
      };
      return (
        <div key={i} style={rightStyle} className="chatbox-msg">
          <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{e.user}</p>
          <p style={{ color: 'grey' }}>{e.message}</p>
        </div>
      );
    // } else {
    //   const leftStyle = {
    //     color: '#1976d2',
    //     textAlign: 'left',
    //     backgroundColor: '#ededed',
    //     padding: '8px',
    //     marginBottom: '5px',
    //   };
    //   return (
    //     <div key={i} style={leftStyle} className="chatbox-msg">
    //       <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{e[i].user}</p>
    //       <p style={{ color: 'grey' }}>{e[i].message}</p>
    //     </div>
    //   );
    // }
  });

  return (
    <div className="chatbox">
      {console.log('chatbox renders')}
      <div id="message-container">
        <h3>Room Chat</h3>
        <div id="message-container-inner">
          {messages}
        </div>
        <div ref={last} />
      </div>
      <div id="chatbox-input">
        <form>
          <input
            type="text"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
            }}
          ></input>
          <Button
            id="chatbox-input-button"
            variant="text"
            onClick={sendMessage}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Chatbox;
