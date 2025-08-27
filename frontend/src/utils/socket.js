import { io } from 'socket.io-client';
import HOST from './routes';

class SocketSingleton {
  constructor() {
    if (!SocketSingleton.instance) {
      const socketUrl = process.env.NODE_ENV === 'production' 
        ? HOST 
        : 'http://localhost:5000';
      
      // console.log('Connecting to socket server at:', socketUrl);
      
      SocketSingleton.instance = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true
      });

      // Add connection event listeners
      SocketSingleton.instance.on('connect', () => {
        // console.log('Socket connected successfully');
      });

      SocketSingleton.instance.on('connect_error', (error) => {
        // console.error('Socket connection error:', error);
        // Try to reconnect with polling if websocket fails
        if (SocketSingleton.instance.io.opts.transports[0] === 'websocket') {
          // console.log('Switching to polling transport...');
          SocketSingleton.instance.io.opts.transports = ['polling', 'websocket'];
        }
      });

      SocketSingleton.instance.on('disconnect', (reason) => {
        // console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          SocketSingleton.instance.connect();
        }
      });

      SocketSingleton.instance.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
      });

      SocketSingleton.instance.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
      });

      SocketSingleton.instance.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
      });
    }
  }

  getInstance() {
    return SocketSingleton.instance;
  }
}

export default SocketSingleton;
