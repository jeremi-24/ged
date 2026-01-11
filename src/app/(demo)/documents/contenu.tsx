'use client';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Card, CardContent } from "@/components/ui/card";
import { DataTableDemo } from "@/components/ux/DataTableDemo";
import { useState } from "react";
import { DocumentData } from "@/types/types";
import DeleteDocuments from "@/lib/services/CRUD/DeleteDocuments";
import UserInfoDialog from "@/components/ux/UserInfoDialog";
import PDFPreview from "@/components/ux/PDFPreview";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Contenu() {
    const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
    const [selectedIds, setSelectedIds] = useState<string>("");

    const loadDocuments = async () => {
        // This is handled inside DataTableDemo but can be triggered from here if needed
    };

    const handleDocumentClick = (document: DocumentData) => {
        setSelectedDocument(document);
    };

    return (
        <div className="mt-6 h-[calc(100vh-120px)] flex flex-col">
            <UserInfoDialog />
            <div className="flex-1 w-full overflow-hidden">
                <ResizablePanelGroup
                    direction="horizontal"
                    className="w-full h-full rounded-3xl overflow-hidden"
                >
                    <ResizablePanel defaultSize={70} minSize={40} className="flex flex-col bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 flex-1 overflow-auto">
                            <DataTableDemo
                                onDocumentClick={handleDocumentClick}
                                setSelectedIds={setSelectedIds}
                                onRefresh={loadDocuments}
                            />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="w-1 bg-transparent hover:bg-blue-500/20 transition-colors" />

                    <ResizablePanel defaultSize={30} minSize={20}>
                        <AnimatePresence mode="wait">
                            {selectedDocument ? (
                                <motion.div
                                    key={selectedDocument.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="h-full flex flex-col bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md"
                                >
                                    {/* Header Info */}
                                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white/50 dark:bg-black/20">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm truncate max-w-[150px] italic">{selectedDocument.name}</h3>
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{selectedDocument.classification}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full"
                                            onClick={() => setSelectedDocument(null)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Preview Area */}
                                    <div className="flex-1 overflow-auto p-4">
                                        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden h-full min-h-[400px]">
                                            <PDFPreview pdfUrl={selectedDocument.url} />
                                        </div>
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-white/50 dark:bg-black/20">
                                        <DeleteDocuments
                                            selectedDocument={selectedDocument}
                                            selectedIds={selectedIds}
                                            setSelectedIds={setSelectedIds}
                                            refreshDocuments={loadDocuments}
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-8 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <Info className="w-8 h-8 opacity-20" />
                                    </div>
                                    <div>
                                        <p className="font-bold italic">Aucun document sélectionné</p>
                                        <p className="text-xs">Sélectionnez un document dans la liste pour voir l&apos;aperçu</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
