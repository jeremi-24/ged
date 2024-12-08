// src/components/LogsComponent.tsx
'use client';
import { Card, CardContent } from '@/components/ui/card';
import { fetchAllLogs } from '@/lib/services/logsAll'; // Assurez-vous d'importer la fonction correctement
import { LogEntry } from '@/types/Logs';
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, User, FileText, Info, Monitor } from 'lucide-react'; // Ajout des icônes supplémentaires
import UserInfoDialog from '@/components/ux/UserInfoDialog';

const LogsComponent: React.FC = () => {
  const [allLogs, setAllLogs] = useState<Record<string, LogEntry[]>>({}); // Stockage des logs par utilisateur
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
    <Card className="rounded-lg border-none mt-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
      <UserInfoDialog/>
        <h2 className="text-3xl font-semibold mb-6"></h2>
        <div className="flex flex-col items-center overflow-auto min-h-[300px] max-h-[350px]">
          {loading ? (
            <p className="text-gray-500">Chargement des activités...</p>
          ) : error ? (
            <div className="flex items-center text-red-600">
              <XCircle className="mr-2" />
              <p>{error}</p>
            </div>
          ) : (
            Object.keys(allLogs).length === 0 ? (
              <p className="text-gray-500">Aucune activité trouvée.</p>
            ) : (
              Object.entries(allLogs).map(([userId, logs]) => (
                <div key={userId} className="mb-4"> {/* Conteneur pour chaque utilisateur */}
                  <h3 className="font-semibold text-lg mb-2">activités pour l&apos;utilisateur: {userId}</h3>
                  <ul className="w-full space-y-4">
                    {logs.map((log) => (
                      <li key={log.documentId} className="flex justify-between items-center p-4 bg-gray-200 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition duration-200">
                        <div className="flex items-start space-x-4">
                          <FileText className="text-gray-400 mt-1" />
                          <div>
                            <p className="font-medium text-blue-600">{log.event}</p>
                            <p className="text-gray-600 text-sm">{new Date(log.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-start space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="text-gray-400" />
                            <p className="text-gray-500 text-sm">{log.userId}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Info className="text-gray-400" />
                            <p className="text-gray-500 text-sm">{log.details}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Monitor className="text-gray-400" />
                            <p className="text-gray-500 text-sm">{log.device}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="text-green-500" />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogsComponent;
