
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { initializeStorage, setMasterPassword } from '@/utils/storage';
import { toast } from '@/hooks/use-toast';

const Setup = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    
    let strength = 0;
    
    // Length check
    if (pass.length >= 8) strength += 20;
    if (pass.length >= 12) strength += 10;
    
    // Complexity checks
    if (/[a-z]/.test(pass)) strength += 10; // Has lowercase
    if (/[A-Z]/.test(pass)) strength += 20; // Has uppercase
    if (/[0-9]/.test(pass)) strength += 20; // Has number
    if (/[^A-Za-z0-9]/.test(pass)) strength += 20; // Has special char
    
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordStrength < 60) {
      toast({
        title: "Weak password",
        description: "Please choose a stronger password for better security.",
        variant: "destructive"
      });
      return;
    }
    
    // Initialize storage and set master password
    initializeStorage();
    setMasterPassword(password);
    
    toast({
      title: "Setup complete!",
      description: "Your password vault has been created successfully."
    });
    
    navigate('/dashboard');
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Create Your Vault</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
            Set a strong master password to secure all your credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Master Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Create a strong password"
              className="w-full"
              required
            />
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Password Strength</span>
                <span className={passwordStrength >= 70 ? "text-green-500" : passwordStrength >= 40 ? "text-yellow-500" : "text-red-500"}>
                  {passwordStrength < 40 ? "Weak" : passwordStrength < 70 ? "Moderate" : "Strong"}
                </span>
              </div>
              <Progress value={passwordStrength} className={getStrengthColor()} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full"
              required
            />
          </div>

          {password && confirmPassword && password !== confirmPassword && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Passwords don't match
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full">
            Create Vault
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Setup;
