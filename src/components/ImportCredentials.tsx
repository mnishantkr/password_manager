
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseImportedFile } from '@/utils/fileParser';
import { saveCredentials } from '@/utils/storage';
import { toast } from '@/hooks/use-toast';
import type { Credential } from '@/pages/Dashboard';

const ImportCredentials = ({ 
  onClose, 
  onImport 
}: { 
  onClose: () => void, 
  onImport: (credentials: Credential[]) => void 
}) => {
  const [fileType, setFileType] = useState('json');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Auto-detect file type from extension
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension === 'json' || extension === 'csv' || extension === 'xml') {
        setFileType(extension);
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fileContent = await file.text();
      const parsedCredentials = parseImportedFile(fileContent, fileType as 'json' | 'csv' | 'xml');
      
      if (parsedCredentials.length === 0) {
        setError('No valid credentials found in the file');
        return;
      }

      // Save to storage
      saveCredentials(parsedCredentials);
      
      toast({
        title: 'Import successful',
        description: `${parsedCredentials.length} credentials have been imported.`
      });
      
      onImport(parsedCredentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Credentials</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>File Type</Label>
            <RadioGroup value={fileType} onValueChange={setFileType} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xml" id="xml" />
                <Label htmlFor="xml">XML</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">Choose File</Label>
            <Input 
              id="file" 
              type="file" 
              accept={`.${fileType}`}
              onChange={handleFileChange}
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={loading || !file}>
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCredentials;
