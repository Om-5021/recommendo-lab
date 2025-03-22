
import React from 'react';
import DashboardLayout from './DashboardLayout';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DashboardContainerProps {
  children: React.ReactNode;
  isLoading?: boolean;
  isAuthenticated?: boolean;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({ 
  children, 
  isLoading = false,
  isAuthenticated = true
}) => {
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-medium">Loading your dashboard...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="container px-4 pt-32 mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Please Login to View Your Dashboard</h1>
          <p className="text-muted-foreground mb-8">
            You need to be logged in to track your course progress
          </p>
          <Button asChild>
            <Link to="/login">Login Now</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

export default DashboardContainer;
