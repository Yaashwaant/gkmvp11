import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertTriangle, RefreshCw, Hash, Database } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

interface BlockchainDashboardProps {
  vehicleNumber: string;
}

interface BlockchainSummary {
  vehicleNumber: string;
  totalBlocks: number;
  odometerReadings: number;
  fraudAlerts: number;
  fraudScore: number;
  isActive: boolean;
  lastValidReading: number;
  chainIntegrity: {
    isValid: boolean;
    errors: string[];
  };
}

export function BlockchainDashboard({ vehicleNumber }: BlockchainDashboardProps) {
  const { data: blockchainData, isLoading } = useQuery({
    queryKey: ['/api/blockchain', vehicleNumber],
    enabled: !!vehicleNumber,
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/blockchain/verify/${vehicleNumber}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to verify blockchain');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blockchain', vehicleNumber] });
    },
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blockchain Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary: BlockchainSummary = blockchainData?.blockchainSummary;

  if (!summary) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blockchain Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No blockchain data found for this vehicle
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRiskLevel = (fraudScore: number) => {
    if (fraudScore === 0) return { level: 'LOW', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    if (fraudScore <= 2) return { level: 'MEDIUM', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
    return { level: 'HIGH', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
  };

  const risk = getRiskLevel(summary.fraudScore);

  return (
    <div className="space-y-4">
      {/* Main Blockchain Status Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blockchain Security Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chain Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {summary.chainIntegrity.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">Chain Integrity</span>
            </div>
            <Badge 
              variant={summary.chainIntegrity.isValid ? "default" : "destructive"}
              className={summary.chainIntegrity.isValid ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}
            >
              {summary.chainIntegrity.isValid ? "VERIFIED" : "CORRUPTED"}
            </Badge>
          </div>

          {/* Fraud Risk Level */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${summary.fraudScore === 0 ? 'text-green-500' : summary.fraudScore <= 2 ? 'text-yellow-500' : 'text-red-500'}`} />
              <span className="font-medium">Risk Level</span>
            </div>
            <Badge className={risk.color}>
              {risk.level}
            </Badge>
          </div>

          {/* Chain Activity Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Chain Status</span>
            </div>
            <Badge variant={summary.isActive ? "default" : "secondary"}>
              {summary.isActive ? "ACTIVE" : "SUSPENDED"}
            </Badge>
          </div>

          {/* Verify Chain Button */}
          <Button 
            onClick={() => verifyMutation.mutate()}
            disabled={verifyMutation.isPending}
            className="w-full mt-4"
            variant="outline"
          >
            {verifyMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Verifying Chain...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Verify Blockchain Integrity
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Blockchain Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{summary.totalBlocks}</p>
                <p className="text-xs text-muted-foreground">Total Blocks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{summary.odometerReadings}</p>
                <p className="text-xs text-muted-foreground">Valid Readings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{summary.fraudAlerts}</p>
                <p className="text-xs text-muted-foreground">Fraud Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{summary.lastValidReading.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Last Valid KM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chain Integrity Errors */}
      {!summary.chainIntegrity.isValid && summary.chainIntegrity.errors.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Blockchain Integrity Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {summary.chainIntegrity.errors.map((error, index) => (
                <li key={index} className="text-sm text-red-700 dark:text-red-400">
                  • {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Fraud Prevention Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anti-Fraud Features Active</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="font-medium">Cross-App Duplicate Detection</p>
                <p className="text-sm text-muted-foreground">Prevents reuse of readings across multiple apps</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="font-medium">Device Fingerprint Validation</p>
                <p className="text-sm text-muted-foreground">Ensures consistent device usage patterns</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="font-medium">Image Manipulation Detection</p>
                <p className="text-sm text-muted-foreground">Analyzes metadata for signs of editing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="font-medium">Impossible Speed Detection</p>
                <p className="text-sm text-muted-foreground">Validates realistic travel distances and times</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}