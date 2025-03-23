
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

interface AuthLayoutProps {
  children: React.ReactNode;
  defaultTab: string;
  onTabChange?: (value: string) => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, defaultTab, onTabChange }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <a href="/" className="text-primary hover:text-primary/90 transition-colors">
              EduPlatform
            </a>
          </h1>
          <p className="text-muted-foreground mt-2">Continue your learning journey</p>
        </div>
        
        <Tabs defaultValue={defaultTab} className="w-full" onValueChange={onTabChange}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="signin" data-value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup" data-value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <Card className="border-none shadow-lg">
            {children}
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthLayout;
