import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Initialize socket connection when user logs in
    if (user) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: true
      });
      
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        // Re-join rooms after reconnection
        if (user.id) {
          newSocket.emit('subscribe-user', user.id);
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
      
      setSocket(newSocket);

      // Clean up on unmount
      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      // Disconnect when user logs out
      socket.disconnect();
      setSocket(null);
    }
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      // Subscribe to user's notifications
      socket.emit('subscribe-user', user.id);
      
      // Handle incoming notifications
      socket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        
        // Also show browser notification if supported
        if (Notification.permission === 'granted') {
          new Notification('FreelanceFlow', {
            body: notification.message,
            icon: '/logo.png' // Add your logo path
          });
        }
      });
      
      // Request notification permission
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      
      return () => {
        socket.off('notification');
      };
    }
  }, [socket, user]);

  const clearNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const joinOrderRoom = (orderId) => {
    if (socket) {
      socket.emit('join-order', orderId);
    }
  };

  const leaveOrderRoom = (orderId) => {
    if (socket) {
      socket.emit('leave-order', orderId);
    }
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      notifications, 
      clearNotification,
      joinOrderRoom,
      leaveOrderRoom
    }}>
      {children}
    </SocketContext.Provider>
  );
};