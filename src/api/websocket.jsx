import { w3cwebsocket as W3CWebSocket } from "websocket";

const setupWebSocket = (onMessageReceived) => {
  const client = new W3CWebSocket(`ws://localhost:8000/ws/chat/`); // Update with your WebSocket URL
  
  client.onopen = () => {
    console.log('WebSocket Client Connected');
    const token = localStorage.getItem('access_token');
    if (token) {
      client.send(JSON.stringify({
        type: 'authorization',
        token: token
      }));
    }
  };
  
  client.onmessage = (message) => {
    const data = JSON.parse(message.data);
    onMessageReceived(data);
  };
  
  client.onclose = () => {
    console.log('WebSocket Client Disconnected');
    // Implement reconnection logic here if desired
  };
  
  return client;
};

export default setupWebSocket;