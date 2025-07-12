const WebSocket = require('ws');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });
  
  const clients = new Map();

  wss.on('connection', (ws, req) => {
    const token = req.url.split('token=')[1];
    if (!token) return ws.close();
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      clients.set(decoded.id, ws);
      
      ws.on('close', () => {
        clients.delete(decoded.id);
      });
    } catch (error) {
      ws.close();
    }
  });

  return {
    sendNotification: (userId, message) => {
      const client = clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'notification', message }));
      }
    }
  };
};

module.exports = setupWebSocket;