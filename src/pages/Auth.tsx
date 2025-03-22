
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import AuthLayout from './auth/AuthLayout';
import SignInForm from './auth/SignInForm';
import SignUpForm from './auth/SignUpForm';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSwitchToSignUp = () => {
    setActiveTab('signup');
  };

  const handleSwitchToSignIn = () => {
    setActiveTab('signin');
  };

  return (
    <AuthLayout defaultTab={activeTab} onTabChange={setActiveTab}>
      <SignInForm 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
      <SignUpForm 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </AuthLayout>
  );
};

export default Auth;
