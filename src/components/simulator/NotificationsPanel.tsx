
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { markAllAsRead, clearNotifications } from '../../store/slices/notificationsSlice';
import { Bell, CheckCircle } from 'lucide-react';

const NotificationsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(state => state.notifications);
  
  // Mark all as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  // Clear all notifications
  const handleClearAll = () => {
    dispatch(clearNotifications());
  };
  
  // Get notification style based on type
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      case 'alert':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'success':
        return 'border-l-4 border-l-green-500 bg-green-50';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50';
    }
  };
  
  return (
    <Card className="h-full max-h-[400px] flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Read All
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto p-0">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <p>No notifications</p>
          </div>
        ) : (
          <ul className="divide-y">
            {notifications.map(notification => (
              <li 
                key={notification.id} 
                className={`p-4 ${notification.read ? 'opacity-70' : 'font-medium'} ${getNotificationStyle(notification.type)}`}
              >
                <div className="flex justify-between">
                  <h4 className="text-sm font-semibold">{notification.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{notification.message}</p>
                {notification.binId && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Bin ID: {notification.binId}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
