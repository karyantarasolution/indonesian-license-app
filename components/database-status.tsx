"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, WifiOff, RefreshCw, Database } from 'lucide-react';
import { config } from '../lib/config';

interface DatabaseStatusProps {
  className?: string;
}

export function DatabaseStatus({ className }: DatabaseStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (config.useLocalStorage) {
        // Simulate connection check for localStorage mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsConnected(true);
        setLastChecked(new Date());
        return;
      }

      // Check MySQL connection
      if (config.useMySQL) {
        const response = await fetch(`${config.mysql.apiUrl}/test`);
        const result = await response.json();
        
        if (result.success) {
          setIsConnected(true);
          setLastChecked(new Date());
          return;
        } else {
          throw new Error(result.error || 'MySQL connection failed');
        }
      }

      // Jika tidak ada MySQL, anggap connected (localStorage)
      setIsConnected(true);
      setLastChecked(new Date());
    } catch (err: any) {
      console.error('Database connection error:', err);
      setIsConnected(false);
      setError(err.message || 'Gagal terhubung ke database');
      setLastChecked(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Checking...
        </Badge>
      );
    }

    if (isConnected === null) {
      return (
        <Badge variant="secondary">
          Unknown
        </Badge>
      );
    }

    if (isConnected) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Connected
        </Badge>
      );
    }

    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Disconnected
      </Badge>
    );
  };

  const getStorageMode = () => {
    if (config.useMySQL) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
          <Database className="h-3 w-3" />
          MySQL Database
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <WifiOff className="h-3 w-3" />
        Local Storage
      </Badge>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Database Status
          <Button
            variant="ghost"
            size="sm"
            onClick={checkConnection}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection:</span>
          {getStatusBadge()}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Storage Mode:</span>
          {getStorageMode()}
        </div>

        {lastChecked && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Checked:</span>
            <span className="text-xs text-gray-500">
              {lastChecked.toLocaleTimeString()}
            </span>
          </div>
        )}

        {error && (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {config.useMySQL && isConnected && (
          <Alert className="border-blue-200 bg-blue-50">
            <Database className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              <strong>MySQL Database Aktif</strong>
              <br />
              Data tersimpan di MySQL. Kelola data via phpMyAdmin di http://localhost/phpmyadmin
            </AlertDescription>
          </Alert>
        )}

        {config.useLocalStorage && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Local Storage Mode</strong>
              <br />
              Menggunakan local storage (data hanya di browser). Setup MySQL untuk menyimpan data secara permanen.
              <br />
              Buat file <code className="bg-gray-100 px-1 rounded">.env.local</code> dan konfigurasi MySQL.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}


