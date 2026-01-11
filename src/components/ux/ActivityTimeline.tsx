'use client';

import React from 'react';
import { LogEntry } from '@/types/Logs';
import {
    FileText,
    Trash2,
    Eye,
    LogIn,
    Settings,
    AlertCircle,
    Clock,
    User,
    Monitor,
    CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ActivityTimelineProps {
    logs: LogEntry[];
    showUser?: boolean;
}

const getEventConfig = (event: string) => {
    const e = event.toLowerCase();
    if (e.includes('upload') || e.includes('ajout')) {
        return {
            icon: FileText,
            color: 'bg-blue-500',
            label: 'Upload',
            textColor: 'text-blue-500'
        };
    }
    if (e.includes('delet') || e.includes('supprim')) {
        return {
            icon: Trash2,
            color: 'bg-red-500',
            label: 'Suppression',
            textColor: 'text-red-500'
        };
    }
    if (e.includes('view') || e.includes('consult')) {
        return {
            icon: Eye,
            color: 'bg-emerald-500',
            label: 'Consultation',
            textColor: 'text-emerald-500'
        };
    }
    if (e.includes('login') || e.includes('connexion')) {
        return {
            icon: LogIn,
            color: 'bg-amber-500',
            label: 'Connexion',
            textColor: 'text-amber-500'
        };
    }
    if (e.includes('update') || e.includes('modif')) {
        return {
            icon: Settings,
            color: 'bg-indigo-500',
            label: 'Modification',
            textColor: 'text-indigo-500'
        };
    }
    return {
        icon: AlertCircle,
        color: 'bg-zinc-500',
        label: event,
        textColor: 'text-zinc-500'
    };
};

const GroupHeader = ({ date }: { date: string }) => {
    let label = date;
    const d = new Date(date);
    if (isToday(d)) label = "Aujourd'hui";
    else if (isYesterday(d)) label = "Hier";
    else label = format(d, 'd MMMM yyyy', { locale: fr });

    return (
        <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {label}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
        </div>
    );
};

export const ActivityTimeline = ({ logs, showUser = false }: ActivityTimelineProps) => {
    // Group logs by date
    const sortedLogs = [...logs].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const groups = sortedLogs.reduce((acc, log) => {
        const dateKey = format(new Date(log.createdAt), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(log);
        return acc;
    }, {} as Record<string, LogEntry[]>);

    return (
        <div className="relative space-y-2">
            <div className="absolute left-[21px] top-4 bottom-4 w-px bg-gradient-to-b from-blue-500/50 via-zinc-200 dark:via-zinc-800 to-transparent hidden sm:block" />

            {Object.entries(groups).map(([date, groupLogs]) => (
                <React.Fragment key={date}>
                    <GroupHeader date={date} />
                    <div className="space-y-4">
                        {groupLogs.map((log, index) => {
                            const config = getEventConfig(log.event);
                            const EventIcon = config.icon;

                            return (
                                <motion.div
                                    key={`${log.documentId}-${index}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative group sm:pl-10"
                                >
                                    {/* Timeline Dot */}
                                    <div className={cn(
                                        "absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-background z-10 hidden sm:block transition-transform group-hover:scale-125",
                                        config.color
                                    )} />

                                    <div className="bg-card hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm transition-all duration-300">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                                    config.color + "10",
                                                    config.textColor
                                                )}>
                                                    <EventIcon className="w-6 h-6" />
                                                </div>

                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                        {log.event}
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                    </h4>
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                                        {log.details || "Aucun détail supplémentaire"}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                                                        <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: fr })}
                                                        </span>
                                                        {showUser && (
                                                            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                                                                <User className="w-3.5 h-3.5" />
                                                                {log.userId}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                                                            <Monitor className="w-3.5 h-3.5" />
                                                            {log.device}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                <div className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800",
                                                    config.textColor
                                                )}>
                                                    {config.label}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </React.Fragment>
            ))}

            {logs.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                        <Clock className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Aucune activité</h3>
                        <p className="text-zinc-500 text-sm">Les journaux d&apos;activité apparaîtront ici.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
