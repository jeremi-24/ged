// src/types.ts

export interface DocumentData {
    id: string;
    name: string;
    classification: string;
    text: string;
    createdAt: Date;
    url: string;
    type: string;
    isArchived: boolean,
    size: number;
    
  }
  
  export interface ArchiveRule{
    classification: string;  
  durationInYears: Date;
  }