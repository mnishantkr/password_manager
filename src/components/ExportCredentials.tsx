
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import type { Credential } from '@/pages/Dashboard';
import { toast } from '@/hooks/use-toast';

interface ExportCredentialsProps {
  credentials: Credential[];
  onClose: () => void;
}

const ExportCredentials: React.FC<ExportCredentialsProps> = ({ credentials, onClose }) => {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  
  const handleExport = () => {
    try {
      let exportData: string;
      let fileName: string;
      let mimeType: string;
      
      if (format === 'json') {
        // Export as JSON
        exportData = JSON.stringify(credentials, null, 2);
        fileName = 'credentials.json';
        mimeType = 'application/json';
      } else {
        // Export as CSV
        const headers = ['name', 'url', 'username', 'password', 'totpSecret', 'category', 'dateAdded'];
        const csvRows = [
          headers.join(','),
          ...credentials.map(cred => [
            escapeCsvValue(cred.name),
            escapeCsvValue(cred.url || ''),
            escapeCsvValue(cred.username),
            escapeCsvValue(cred.password),
            escapeCsvValue(cred.totpSecret || ''),
            escapeCsvValue(cred.category || ''),
            new Date(cred.dateAdded).toISOString()
          ].join(','))
        ];
        exportData = csvRows.join('\n');
        fileName = 'credentials.csv';
        mimeType = 'text/csv';
      }
      
      // Create a blob and download link
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `Your credentials have been exported as ${format.toUpperCase()}.`
      });
      
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting your credentials.",
        variant: "destructive"
      });
    }
  };
  
  // Helper function to escape CSV values
  const escapeCsvValue = (value: string): string => {
    // If the value contains commas, quotes, or newlines, wrap it in quotes
    if (/[",\n\r]/.test(value)) {
      // Double any quotes within the value
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Credentials</DialogTitle>
          <DialogDescription>
            Export your credentials to a file in your preferred format.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={format} onValueChange={(value) => setFormat(value as 'json' | 'csv')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {format === 'json' && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                JSON format preserves all credential data and is ideal for backups.
              </div>
            )}
            
            {format === 'csv' && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                CSV format is compatible with spreadsheet applications and other password managers.
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={credentials.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export {credentials.length} Credentials
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportCredentials;
