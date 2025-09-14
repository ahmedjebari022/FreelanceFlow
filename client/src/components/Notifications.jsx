import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';

const Notifications = () => {
  const { notifications, clearNotification } = useContext(SocketContext);
  const navigate = useNavigate();

  const handleNotificationClick = (notification, index) => {
    clearNotification(index);
    
    if (notification.orderId) {
      navigate(`/orders/${notification.orderId}`);
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="toast toast-end z-50">
      {notifications.map((notification, index) => (
        <div 
          key={index} 
          className="alert alert-info cursor-pointer"
          onClick={() => handleNotificationClick(notification, index)}
        >
          <span>{notification.message}</span>
          <button 
            className="btn btn-circle btn-xs"
            onClick={(e) => {
              e.stopPropagation();
              clearNotification(index);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;