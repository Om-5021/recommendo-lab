
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Notification } from '@/hooks/useNotifications';

interface NavbarNotificationsProps {
  unreadCount: number;
  notifications: Notification[];
  markAllAsRead: () => void;
}

const NavbarNotifications = ({ unreadCount, notifications, markAllAsRead }: NavbarNotificationsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground dark:text-gray-300" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-5 h-5 flex items-center justify-center text-xs" 
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 dark:bg-gray-800 dark:border-gray-700">
        <DropdownMenuLabel className="flex justify-between items-center dark:text-gray-200">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7 dark:text-gray-300 dark:hover:bg-gray-700">
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:bg-gray-700" />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 dark:hover:bg-gray-700 focus:dark:bg-gray-700">
                <div className="flex justify-between w-full">
                  <span className="font-medium dark:text-gray-200">{notification.title}</span>
                  {!notification.read && (
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">New</Badge>
                  )}
                </div>
                <span className="text-muted-foreground text-sm mt-1 dark:text-gray-400">{notification.message}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground dark:text-gray-400">
              No notifications
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavbarNotifications;
