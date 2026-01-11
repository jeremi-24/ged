'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, ExternalLink } from "lucide-react";
import { DocumentData } from "@/types/types";
import Link from 'next/link';

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "à l'instant";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `il y a ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `il y a ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `il y a ${diffInDays} j`;
    return date.toLocaleDateString('fr-FR');
}

interface RecentActivityProps {
    documents: DocumentData[];
}

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function RecentActivity({ documents }: RecentActivityProps) {
    const recentDocs = [...documents]
        .sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

    return (
        <Card className="border-none shadow-xl bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                        <Clock className="w-5 h-5" />
                    </div>
                    Activité Récente
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative space-y-4">
                    {/* Vertical line */}
                    <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/50 via-zinc-200 dark:via-zinc-800 to-transparent hidden sm:block" />

                    {recentDocs.length > 0 ? (
                        recentDocs.map((doc, index) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative group pl-0 sm:pl-10"
                            >
                                {/* Timeline Dot */}
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 border-2 border-background z-10 hidden sm:block transition-transform group-hover:scale-150" />

                                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-all duration-300 group/item">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 group-hover/item:scale-110 transition-transform">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate group-hover/item:text-blue-500 transition-colors">{doc.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="shrink-0">{formatRelativeTime(doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt))}</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-300" />
                                            <span className="truncate italic">Ajouté par vous</span>
                                        </div>
                                    </div>
                                    <Link
                                        href={doc.url}
                                        target="_blank"
                                        className="p-2 text-zinc-400 opacity-0 group-hover:opacity-100 transition-all hover:text-blue-500 hover:bg-blue-500/10 rounded-lg"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-zinc-400 gap-2">
                            <FileText className="w-8 h-8 opacity-20" />
                            <p className="text-sm italic">Aucun document récent</p>
                        </div>
                    )}
                </div>

                {recentDocs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
                        <Link href="/recherche" className="text-xs font-bold text-blue-500 hover:underline">
                            Voir tous les documents
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
