
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface SignUpFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSwitchToSignIn: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  onSwitchToSignIn 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + from,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: 'Registration successful',
        description: 'Please check your email to confirm your account',
      });
      
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TabsContent value="signup" className="m-0">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Sign up to start your learning journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                minLength={6}
                required
              />
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <div className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button 
            onClick={onSwitchToSignIn}
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </button>
        </div>
      </CardFooter>
    </TabsContent>
  );
};

export default SignUpForm;
