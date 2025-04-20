// Create a single WebSocket service
// services/chatSocket.js
let socket = null;

export const connectSocket = (chatRoomId, onMessage) => {
  const token = localStorage.getItem('accessToken');
  const wsUrl = `ws://localhost:8001/ws/chat/${chatRoomId}/?token=${token}`;
  
  if (socket) {
    socket.close();
  }

  socket = new WebSocket(wsUrl);

  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    onMessage(data);
  };

  socket.onclose = () => {
    console.log('Socket closed');
    // Implement reconnection logic if needed
  };

  return socket;
};

export const sendSocketMessage = (message) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
};