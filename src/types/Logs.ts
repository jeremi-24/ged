
export interface LogEntry {
    event: string;  
    documentId: string;  
     userId : string;
    createdAt: Date; 
    details?: string;  
    device : string;
  }
  