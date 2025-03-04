
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, Copy, Clock, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from '@/hooks/use-toast';
import { generateTOTP } from '@/utils/totp';
import type { Credential } from '@/pages/Dashboard';

const CredentialCard = ({ credential }: { credential: Credential }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);

  useEffect(() => {
    if (credential.totpSecret) {
      const updateTOTP = () => {
        const { token, secondsRemaining } = generateTOTP(credential.totpSecret || '');
        setTotpCode(token);
        setTimeRemaining(secondsRemaining);
      };
      
      updateTOTP();
      const interval = setInterval(updateTOTP, 1000);
      
      return () => clearInterval(interval);
    }
  }, [credential.totpSecret]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied`,
      description: `${label} has been copied to your clipboard.`
    });
  };

  const getUrlDomain = (url?: string) => {
    if (!url) return null;
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return domain;
    } catch {
      return url;
    }
  };

  const openWebsite = (url?: string) => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium text-lg">{credential.name}</h3>
            {credential.url && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="truncate max-w-[180px]">{getUrlDomain(credential.url)}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 ml-1" 
                  onClick={() => openWebsite(credential.url)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          {credential.category && (
            <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              {credential.category}
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Username</div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium truncate mr-2">{credential.username}</div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => copyToClipboard(credential.username, "Username")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Password</div>
            <div className="flex items-center justify-between">
              <div className="flex-1 text-sm font-medium truncate mr-2">
                {showPassword ? credential.password : '•'.repeat(8)}
              </div>
              <div className="flex">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7 mr-1" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => copyToClipboard(credential.password, "Password")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {credential.totpSecret && (
            <div>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>TOTP Code</span>
                    <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">
                      {timeRemaining}s
                    </span>
                  </div>
                  <div className="text-sm font-mono font-medium tracking-wider">
                    {totpCode}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => copyToClipboard(totpCode, "TOTP code")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 dark:bg-gray-800 px-4 py-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Added {new Date(credential.dateAdded).toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CredentialCard;
