// src/components/LogsComponent.tsx
'use client';
import { Card, CardContent } from '@/components/ui/card';
import { fetchAllLogs } from '@/lib/services/logsAll'; // Assurez-vous d'importer la fonction correctement
import { LogEntry } from '@/types/Logs';
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, User, FileText, Info, Monitor } from 'lucide-react'; // Ajout des icônes supplémentaires
import UserInfoDialog from '@/components/ux/UserInfoDialog';

import { ActivityTimeline } from '@/components/ux/ActivityTimeline';

const LogsComponent: React.FC = () => {
  const [allLogs, setAllLogs] = useState<Record<string, LogEntry[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const fetchedLogs = await fetchAllLogs();
        setAllLogs(fetchedLogs);
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
          Administration des Activités
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Suivi global de toutes les actions utilisateur sur la plateforme.
        </p>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <Card className="rounded-3xl border-zinc-100 dark:border-zinc-800 shadow-xl bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
            <CardContent className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-zinc-500 animate-pulse">Chargement de toutes les activités...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="rounded-3xl border-zinc-100 dark:border-zinc-800 shadow-xl bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
            <CardContent className="p-20 flex items-center justify-center text-red-500 gap-3">
              <XCircle className="w-6 h-6" />
              <p className="font-semibold">{error}</p>
            </CardContent>
          </Card>
        ) : Object.keys(allLogs).length === 0 ? (
          <Card className="rounded-3xl border-zinc-100 dark:border-zinc-800 shadow-xl bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
            <CardContent className="p-20 text-center text-zinc-500">
              Aucune activité trouvée dans le système.
            </CardContent>
          </Card>
        ) : (
          Object.entries(allLogs).map(([userId, logs]) => (
            <Card key={userId} className="rounded-3xl border-zinc-100 dark:border-zinc-800 shadow-lg bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl overflow-hidden">
              <div className="bg-zinc-100/50 dark:bg-zinc-900/50 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Activités pour l&apos;utilisateur : <span className="text-blue-500">{userId}</span>
                </h3>
              </div>
              <CardContent className="p-6">
                <ActivityTimeline logs={logs} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LogsComponent;
