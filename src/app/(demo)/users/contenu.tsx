'use client';

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { fetchDocumentAges } from "@/lib/services/DocumentAgeDocument";
import UserInfoDialog from "@/components/ux/UserInfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { FileClock, History, Archive, CheckCircle2, AlertCircle, Calendar, Trash2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Contenu2() {
  const [documentAges, setDocumentAges] = useState<{
    documentId: string;
    createdAt: Date;
    ageInYears: string;
    isArchived: boolean;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userId = user.uid;
        try {
          const ages = await fetchDocumentAges(userId);
          setDocumentAges(ages);
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-8 mt-8">
      <UserInfoDialog />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
            Rétention & Cycle de vie
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Suivi de l&apos;âge de vos documents et gestion de l&apos;archivage automatique.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-100/50 dark:bg-zinc-950/50 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="px-4 py-2 text-center border-r border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-tight">Total</p>
            <p className="text-xl font-bold dark:text-white leading-tight">{documentAges.length}</p>
          </div>
          <div className="px-4 py-2 text-center text-emerald-500">
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest leading-tight">Actifs</p>
            <p className="text-xl font-bold leading-tight">{documentAges.filter(d => !d.isArchived).length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {documentAges.length > 0 ? (
          documentAges.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((doc, index) => (
            <motion.div
              key={doc.documentId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="rounded-3xl border-zinc-100 dark:border-zinc-800 shadow-md bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-105 duration-500",
                        doc.isArchived ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {doc.isArchived ? <Archive className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg italic">
                            Doc ID: {doc.documentId.substring(0, 8)}...
                          </h4>
                          <Badge variant={doc.isArchived ? "secondary" : "default"} className={cn(
                            "rounded-full px-4 border-none shadow-sm capitalize",
                            doc.isArchived ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                          )}>
                            {doc.isArchived ? "Archivé" : "Actif"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 font-medium">
                          <span className="flex items-center gap-2 text-sm text-zinc-500">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            Créé le {doc.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-2 text-sm text-zinc-500">
                            <FileClock className="w-4 h-4 text-amber-500" />
                            Ancienneté: <span className="text-zinc-900 dark:text-zinc-100 italic">{doc.ageInYears}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Button variant="outline" className="rounded-2xl border-zinc-200 dark:border-zinc-800 hover:bg-blue-500 hover:text-white transition-all duration-300">
                        Voir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="py-24 text-center space-y-4 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400 ring-8 ring-zinc-50 dark:ring-zinc-900/50">
              <History className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold dark:text-zinc-100">Aucun document tracé</h3>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto">Importez des documents pour commencer à suivre leur cycle de vie et leur âge légal.</p>
            </div>
            <Button className="rounded-2xl bg-blue-500 hover:bg-blue-600 shadow-xl shadow-blue-500/20 px-8">
              Importer maintenant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
