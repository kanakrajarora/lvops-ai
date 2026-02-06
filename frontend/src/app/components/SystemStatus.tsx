import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Server, CheckCircle2, Cloud, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/services/supabase";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://lv-ops-ai.onrender.com";

export function SystemStatus() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [storageStatus, setStorageStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    checkApiStatus();
    checkStorageStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/predict?flight_number=TEST&date=2026-02-05`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      setApiStatus('online');
      console.log('✅ FastAPI backend is online');
    } catch {
      setApiStatus('offline');
      console.log('⚠️ FastAPI backend is offline or unreachable');
    }
  };

  const checkStorageStatus = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setStorageStatus('connected');
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'User');
        console.log('✅ Supabase storage connected');
      } else {
        setStorageStatus('error');
      }
    } catch {
      setStorageStatus('error');
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/60 shadow-sm">
      <CardContent className="py-5 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* API Status */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Server className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Backend API</div>
                <div className="flex items-center gap-2">
                  {apiStatus === 'checking' ? (
                    <span className="text-sm text-muted-foreground">Checking...</span>
                  ) : apiStatus === 'online' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-700">
                        Connected
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-700">
                        Offline
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Storage */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Cloud className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Supabase Storage</div>
                <div className="flex items-center gap-2">
                  {storageStatus === 'checking' ? (
                    <span className="text-sm text-muted-foreground">Checking...</span>
                  ) : storageStatus === 'connected' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-700">
                        Connected
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-700">
                        Error
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div>
              <Badge 
                variant={apiStatus === 'online' && storageStatus === 'connected' ? 'default' : 'destructive'}
                className={`px-4 py-2 font-medium ${apiStatus === 'online' && storageStatus === 'connected' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              >
                {apiStatus === 'online' && storageStatus === 'connected' ? '🟢 System Online' : '🔴 System Issues'}
              </Badge>
            </div>
          </div>

          {/* Endpoint Info */}
          <div className="text-xs text-muted-foreground">
            <span className="font-mono bg-white px-3 py-1.5 rounded-lg border border-border">{API_BASE_URL}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
