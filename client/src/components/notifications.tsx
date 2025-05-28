import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, X, Check, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  isRead: boolean;
}

interface NotificationsProps {
  theme: string;
}

export default function Notifications({ theme }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "File Upload Complete",
      message: "acknowledgementSlip_S186062318569.pdf has been successfully uploaded",
      type: "success",
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      isRead: false,
    },
    {
      id: "2", 
      title: "Node Recovery",
      message: "Node5 has been successfully recovered and is now healthy",
      type: "success",
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      isRead: false,
    },
    {
      id: "3",
      title: "Storage Warning",
      message: "Node3 storage usage is above 85%. Consider adding more nodes.",
      type: "warning", 
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: false,
    },
    {
      id: "4",
      title: "System Update",
      message: "FileSanctum v2.1.0 is now available with improved security features",
      type: "info",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error": return <X className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAllAsRead();
        }}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className={`absolute right-0 top-12 w-96 z-50 shadow-lg border ${
          theme === 'dark' ? 'bg-white text-black' : 'bg-gray-900 text-white'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium truncate">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {getTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 ml-2"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}