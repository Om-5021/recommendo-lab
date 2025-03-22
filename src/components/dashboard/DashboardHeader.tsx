
import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardHeaderProps {
  userName: string | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-up">
      <div className="flex items-center mb-4 md:mb-0">
        <Avatar className="h-16 w-16 mr-4 border-2 border-white shadow-md">
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback>{userName?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {userName || 'there'}!</h1>
          <p className="text-muted-foreground">Ready to continue your learning journey?</p>
        </div>
      </div>
      <div className="flex space-x-3">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Bell size={16} />
          <span>Notifications</span>
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Settings size={16} />
          <span>Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
