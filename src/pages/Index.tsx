
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Key, FileImport, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container px-4 py-16 mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="p-3 rounded-full bg-primary/10 mb-4">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            PassKeeper Nexus
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
            Your secure vault for all your passwords. Import, organize, and access your credentials with ease and confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="px-8">
              <Link to="/setup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <FeatureCard 
            icon={<Key className="h-8 w-8 text-primary" />}
            title="Secure Password Storage"
            description="All your passwords are encrypted using AES-256 encryption, ensuring top-notch security." 
          />
          <FeatureCard 
            icon={<FileImport className="h-8 w-8 text-primary" />}
            title="Multi-Format Import"
            description="Import credentials from various password managers in formats like JSON, CSV, and more." 
          />
          <FeatureCard 
            icon={<Clock className="h-8 w-8 text-primary" />}
            title="TOTP Integration"
            description="Generate Time-Based One-Time Passwords directly within the app for enhanced security." 
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-2 rounded-full bg-primary/10 inline-block mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export default Index;
