'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HardDrive } from "lucide-react";

interface StorageCardProps {
    used: number; // in bytes
    total: number; // in bytes
}

export function StorageCard({ used, total }: StorageCardProps) {
    const percentage = (used / total) * 100;

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Card className="overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Stockage Utilisé</CardTitle>
                <HardDrive className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatSize(used)}</div>
                <p className="text-xs text-muted-foreground mb-4">
                    sur {formatSize(total)} disponible
                </p>
                <Progress value={percentage} className="h-2 bg-primary/10" />
                <p className="mt-2 text-right text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {percentage.toFixed(1)}% utilisé
                </p>
            </CardContent>
        </Card>
    );
}
