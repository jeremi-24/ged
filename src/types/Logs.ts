// src/types/logs.ts
export interface LogEntry {
    event: string;  // Type d'événement (ex: "document_uploaded", "document_deleted")
    documentId: string;  // ID du document concerné
     userId : string;
    createdAt: Date; // Heure de l'événement
    details?: string;  // Informations supplémentaires (facultatif)
    device : string;
  }
  