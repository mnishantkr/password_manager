
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import { validateMasterPassword } from '@/utils/storage';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const isValid = validateMasterPassword(password);
      
      if (isValid) {
        toast({
          title: "Login successful",
          description: "Welcome back to your secure vault."
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Incorrect password",
          description: "The master password you entered is incorrect.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Access Your Vault</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
            Enter your master password to access your credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="masterPassword" className="block text-sm font-medium">
              Master Password
            </label>
            <Input
              id="masterPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your master password"
              className="w-full"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Unlock Vault"}
          </Button>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Don't have a vault yet?{" "}
            <Button variant="link" className="p-0" onClick={() => navigate('/setup')}>
              Create one now
            </Button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
