'use client';
import { Card, CardContent } from '@/components/ui/card';
import { fetchLogs } from '@/lib/services/logsServices';
import { LogEntry } from '@/types/Logs';
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, User, FileText, Info, Monitor } from 'lucide-react'; 
import { auth } from '@/firebase/config';
import UserInfoDialog from '@/components/ux/UserInfoDialog';

import { ActivityTimeline } from '@/components/ux/ActivityTimeline';

const LogsComponent: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      if (!auth.currentUser) {
        setError('Utilisateur non authentifié.');
        setLoading(false);
        return;
      }

      const userId = auth.currentUser.uid;
      try {
        const fetchedLogs = await fetchLogs(userId);
        setLogs(fetchedLogs);
      } catch (err) {
        setError('Erreur lors de la récupération des logs.');
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  return (
    <div className="space-y-6 mt-6">
      <UserInfoDialog />

      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
          Journal d&apos;activité
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Consultez l&apos;historique complet de vos interactions et modifications.
        </p>
      </div>

      <Card className="rounded-3xl border-zinc-100 dark:border-zinc-800 shadow-xl bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl transition-all duration-500">
        <CardContent className="p-6 sm:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-zinc-500 animate-pulse">Chargement de vos activités...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-500 gap-3">
              <XCircle className="w-6 h-6" />
              <p className="font-semibold">{error}</p>
            </div>
          ) : (
            <ActivityTimeline logs={logs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsComponent;
