
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { getCredentials } from '@/utils/storage';
import CredentialCard from '@/components/CredentialCard';
import ImportCredentials from '@/components/ImportCredentials';

export type Credential = {
  id: string;
  name: string;
  url?: string;
  username: string;
  password: string;
  totpSecret?: string;
  category?: string;
  dateAdded: number;
};

const Dashboard = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    // Load credentials when component mounts
    const storedCredentials = getCredentials();
    setCredentials(storedCredentials);
  }, []);

  const filteredCredentials = credentials.filter(cred => 
    cred.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cred.url && cred.url.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cred.category && cred.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Your Secure Vault</h1>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search credentials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setShowImport(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {credentials.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No credentials yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Start by importing your credentials or adding them manually
            </p>
            <Button onClick={() => setShowImport(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Import Credentials
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCredentials.map(credential => (
              <CredentialCard 
                key={credential.id} 
                credential={credential}
              />
            ))}
          </div>
        )}

        {showImport && (
          <ImportCredentials 
            onClose={() => setShowImport(false)}
            onImport={(newCredentials) => {
              setCredentials(prev => [...prev, ...newCredentials]);
              setShowImport(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
