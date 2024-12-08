'use client';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Card, CardContent } from "@/components/ui/card";
import { DataTableDemo } from "@/components/ux/DataTableDemo";
import { useEffect, useState } from "react";
import { DocumentData } from "@/types/types";
import DeleteDocuments from "@/lib/services/CRUD/DeleteDocuments";
import { fetchDocuments } from "@/lib/services/CRUD/fetchDocument";
import UserInfoDialog from "@/components/ux/UserInfoDialog";
import PDFPreview from "@/components/ux/PDFPreview";

export function Contenu() {
    const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
    const [selectedIds, setSelectedIds] = useState<string>("");
  
    // Fonction pour charger les documents
    const loadDocuments = async () => {
         
    };
    // Fonction pour mettre à jour le document sélectionné
    const handleDocumentClick = (document: DocumentData) => {
        setSelectedDocument(document);
    };

    return (
        <div className="mt-6">
        <UserInfoDialog />
        <div className="w-full">
            <ResizablePanelGroup
                direction="horizontal"
                className="w-full rounded-lg border"
            >
                <ResizablePanel defaultSize={70} className="p-5 flex">
                    <DataTableDemo
                        onDocumentClick={handleDocumentClick}
                        setSelectedIds={setSelectedIds}
                        onRefresh={loadDocuments} 
                    />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={30}>
                    <ResizablePanelGroup direction="vertical" className="h-full">
                        <ResizablePanel defaultSize={90} className="flex">
                            {selectedDocument && (
                                <div className=" ">
                                    <PDFPreview pdfUrl={selectedDocument.url} />
                                </div>
                            )}
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={10}>
                            <div className="flex h-full items-center justify-center p-6">
                                <DeleteDocuments
                                    selectedDocument={selectedDocument}
                                    selectedIds={selectedIds}
                                    setSelectedIds={setSelectedIds}
                                    refreshDocuments={loadDocuments}
                                />
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    </div>
    );
}
