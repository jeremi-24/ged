'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Book, Trash2, TriangleAlert, Users } from "lucide-react";
import { fetchDocuments } from '@/lib/services/CRUD/fetchDocument';
import { fetchDocumentsWithOneMonthTillArchival } from '@/lib/services/Documentecheance';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import UserInfoDialog from '@/components/ux/UserInfoDialog';
import { fetchUserCount } from '@/lib/fetchUsers';
import { DocumentData } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';

export function Contenu({ onDataLoaded }: { onDataLoaded?: (docs: DocumentData[]) => void }) {
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [archivedCount, setArchivedCount] = useState(0);
    const [archivingSoonCount, setArchivingSoonCount] = useState(0);
    const [activeUsers, setActiveUsers] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        let isMounted = true;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // On ne déclenche le loading que si on n'a pas encore de données
                if (documents.length === 0) setLoading(true);
                
                try {
                    const docs = await fetchDocuments();
                    if (!isMounted) return;

                    setDocuments(docs);
                    
                    // Cette ligne causait la boucle avant le useCallback
                    if (onDataLoaded) onDataLoaded(docs);

                    const archived = docs.filter(d => d.isArchived).length;
                    setArchivedCount(archived);

                    const { total: soon } = await fetchDocumentsWithOneMonthTillArchival(user.uid);
                    setArchivingSoonCount(soon);

                    const userCount = await fetchUserCount();
                    setActiveUsers(userCount);
                } catch (error) {
                    console.error("Error fetching dashboard data:", error);
                } finally {
                    if (isMounted) setLoading(false);
                }
            } else {
                if (isMounted) setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [onDataLoaded]); // onDataLoaded est maintenant stable grâce au useCallback du parent

    const metrics = [
        {
            title: "Total Documents",
            value: documents.length,
            icon: <Book className="text-blue-500" />,
            bg: "bg-blue-500/10",
            link: "/recherche"
        },
        {
            title: "Archivés",
            value: archivedCount,
            icon: <Trash2 className="text-green-500" />,
            bg: "bg-green-500/10"
        },
        {
            title: "Archivage (1 mois)",
            value: archivingSoonCount,
            icon: <TriangleAlert className="text-red-500" />,
            bg: "bg-red-500/10"
        },
        {
            title: "Utilisateurs Actifs",
            value: activeUsers,
            icon: <Users className="text-indigo-500" />,
            bg: "bg-indigo-500/10"
        }
    ];

    return (
        <div className="mt-6">
            <UserInfoDialog />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="border-none bg-card/50 backdrop-blur">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-8 w-12" />
                                    </div>
                                    <Skeleton className="h-12 w-12 rounded-2xl" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                    : metrics.map((m, i) => (
                        <Card
                            key={i}
                            className="group hover:shadow-xl transition-all duration-300 border-none bg-card/50 backdrop-blur cursor-pointer"
                            onClick={() => m.link && (window.location.href = m.link)}
                        >
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">{m.title}</p>
                                        <h3 className="text-3xl font-bold tracking-tight">{m.value}</h3>
                                    </div>
                                    <div className={`p-3 rounded-2xl ${m.bg} group-hover:scale-110 transition-transform`}>
                                        {React.cloneElement(m.icon as React.ReactElement, { size: 24 })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
            </div>
        </div>
    );
}