'use client';
import { Card, CardContent } from '@/components/ui/card';
import { fetchLogs } from '@/lib/services/logsServices';
import { LogEntry } from '@/types/Logs';
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, User, FileText, Info, Monitor } from 'lucide-react'; // Ajout des icônes supplémentaires
import { auth } from '@/firebase/config';
import UserInfoDialog from '@/components/ux/UserInfoDialog';

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

      const userId = auth.currentUser.uid; // Obtenir l'ID de l'utilisateur authentifié
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
    <Card className="rounded-lg border-none mt-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
      <UserInfoDialog/>
         <h2 className="text-3xl font-semibold mb-6"></h2>
        <div className="flex flex-col items-center overflow-auto min-h-[300px] max-h-[350px]">
         

          {loading ? (
            <p className="text-gray-500">Chargement des logs...</p>
          ) : error ? (
            <div className="flex items-center text-red-600   ">
              <XCircle className="mr-2" />
              <p>{error}</p>
            </div>
          ) : (
            <ul className="w-full space-y-4"> {/* Ajout de l'espace entre les éléments */}
              {logs.map((log) => (
                <li key={log.documentId} className="flex justify-between items-center p-4 bg-gray-200 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition duration-200">
                  
                  {/* Contenu des logs avec les icônes à gauche */}
                  <div className="flex items-start space-x-4"> 
                    {/* Icône du document */}
                    <FileText className="text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium text-blue-600">{log.event}</p>
                      <p className="text-gray-600 text-sm">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start space-y-2">
                    <div className="flex items-center space-x-2">
                      {/* Icône utilisateur */}
                      <User className="text-gray-400" />
                      <p className="text-gray-500 text-sm">{log.userId}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Icône des détails */}
                      <Info className="text-gray-400" />
                      <p className="text-gray-500 text-sm">{log.details}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Icône appareil (device) */}
                      <Monitor className="text-gray-400" />
                      <p className="text-gray-500 text-sm">{log.device}</p>
                    </div>
                  </div>

                  {/* Icône de confirmation (succès) à droite */}
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500" />
                  </div>

                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogsComponent;
