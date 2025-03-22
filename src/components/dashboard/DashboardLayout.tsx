
import React from 'react';
import Navbar from '@/components/Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  isLoading = false 
}) => {
  // Smooth load animation
  React.useEffect(() => {
    document.body.classList.add('page-transition');
    return () => {
      document.body.classList.remove('page-transition');
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container px-4 mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
