'use client';

import { ButtonAnimation } from "@/components/snippet/button-animation";
import { Eye, Link, Sparkles, FileText, Loader2, CheckCircle2, Clock, BrainCircuit, HardDriveDownload, AlertCircle, ChevronRight, Wand2 } from "lucide-react";
import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/ux/FileUpload";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogClose, DialogPortal, DialogOverlay, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { storage, firestore } from "@/firebase/config";
import { uploadBytesResumable, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import classifyDocument from "@/lib/services/classifyDocument";
import pdfToImages from "@/lib/services/pdfToImages";
import OCRImages from "@/lib/services/OCRImages";
import './style.css';
import Tesseract from "tesseract.js";
import { LogEntry } from "@/types/Logs";
import { logEvent } from "@/lib/services/logEvent";
import { getDeviceInfo } from "@/lib/utils/deviceInfo";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import FileSelector from "@/components/ux/FileStart";
import UserInfoDialog from "@/components/ux/UserInfoDialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Étape 1: Interface pour DocumentData
interface DocumentData {
  id: string;
  name: string;
  classification: string;
  text: string;
  createdAt: Date;
  url: string;
  type: string;
  size: number;
  isArchived: boolean;
  metadata?: any;
}

interface ProcessingFile {
  name: string;
  progress: number;
  step: 'waiting' | 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error';
  error?: string;
}

export default function Contenu() {
  const [uploading, setUploading] = useState(false);
  const [activeFiles, setActiveFiles] = useState<Record<string, ProcessingFile>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");

  const [documentDataList, setDocumentDataList] = useState<DocumentData[]>([]);
  const [loadingFinished, setLoadingFinished] = useState(false);

  const updateFileStatus = (fileName: string, update: Partial<ProcessingFile>) => {
    setActiveFiles(prev => ({
      ...prev,
      [fileName]: { ...prev[fileName], ...update }
    }));
  };

  const handleDrop = async (files: File[]) => {
    setUploading(true);
    setLoadingFinished(false);
    setDocumentDataList([]);

    const initialFiles: Record<string, ProcessingFile> = {};
    files.forEach(f => {
      initialFiles[f.name] = { name: f.name, progress: 0, step: 'waiting' };
    });
    setActiveFiles(initialFiles);

    try {
      const uploadPromises = files.map(file => {
        if (file.type === 'application/pdf') {
          return handlePdfUpload(file);
        } else {
          return handleImageUpload(file);
        }
      });

      await Promise.all(uploadPromises);

      setLoadingFinished(true);
      setDialogTitle("Succès");
      setDialogDescription("Tous vos documents ont été analysés et classés par l'IA.");
      setDialogOpen(true);
    } catch (error: any) {
      console.error("Batch upload error:", error);
    } finally {
      // On garde activeFiles un court instant pour l'animation puis on nettoie
      setTimeout(() => setUploading(false), 2000);
    }
  };


  const handlePdfUpload = async (file: File) => {
    updateFileStatus(file.name, { step: 'processing', progress: 10 });

    try {
      const pdfUrl = URL.createObjectURL(file);
      const imageUrls = await pdfToImages(pdfUrl, {
        onProgress: (p) => updateFileStatus(file.name, { progress: 10 + (p.current / p.total) * 20 }),
      });

      updateFileStatus(file.name, { step: 'processing', progress: 40 });
      const textsObj: Record<string, string> = await OCRImages(imageUrls, {
        onProgress: (p) => updateFileStatus(file.name, { progress: 40 + (p.current / p.total) * 20 }),
      });
      const texts: string[] = Object.values(textsObj);

      updateFileStatus(file.name, { step: 'analyzing', progress: 70 });
      const result = await classifyDocument(texts.join('\n'), {
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
        model: 'gemini-3-flash-preview',
      }, imageUrls[0]);

      updateFileStatus(file.name, { step: 'uploading', progress: 85 });
      const storageRef = ref(storage, `documents/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Non connecté");

      const { classification, full_text, metadata } = result;
      const docRef = await addDoc(collection(firestore, "users", user.uid, "documents"), {
        name: file.name,
        classification,
        text: full_text || texts.join('\n'),
        metadata: metadata || {},
        createdAt: new Date(),
        url: downloadURL,
        type: file.type,
        size: file.size,
        isArchived: false,
      });

      setDocumentDataList(prev => [...prev, {
        id: docRef.id,
        name: file.name,
        classification,
        text: full_text || texts.join('\n'),
        metadata: metadata || {},
        createdAt: new Date(),
        url: downloadURL,
        type: file.type,
        size: file.size,
        isArchived: false,
      }]);

      updateFileStatus(file.name, { step: 'completed', progress: 100 });

      const deviceDetails = getDeviceInfo();
      await logEvent({
        event: "document_uploaded",
        documentId: docRef.id,
        createdAt: new Date(),
        details: `Document ${file.name} classé comme ${classification}`,
        userId: user.uid,
        device: deviceDetails,
      }, user.uid);

    } catch (error: any) {
      updateFileStatus(file.name, { step: 'error', error: error.message });
      throw error;
    }
  };

  const handleImageUpload = async (file: File) => {
    updateFileStatus(file.name, { step: 'uploading', progress: 10 });

    try {
      const storageRef = ref(storage, `documents/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      updateFileStatus(file.name, { progress: 40 });

      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise((resolve) => { reader.onloadend = resolve; });
      const base64Image = reader.result as string;

      updateFileStatus(file.name, { step: 'analyzing', progress: 60 });
      const result = await classifyDocument("", {
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
        model: 'gemini-3-flash-preview',
      }, base64Image);

      const { classification, full_text, metadata } = result;
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Non connecté");

      const docRef = await addDoc(collection(firestore, "users", user.uid, "documents"), {
        name: file.name,
        classification,
        text: full_text,
        metadata: metadata || {},
        createdAt: new Date(),
        url: downloadURL,
        type: file.type,
        size: file.size,
        isArchived: false,
      });

      setDocumentDataList(prev => [...prev, {
        id: docRef.id,
        name: file.name,
        classification,
        text: full_text,
        metadata: metadata || {},
        createdAt: new Date(),
        url: downloadURL,
        type: file.type,
        size: file.size,
        isArchived: false,
      }]);

      updateFileStatus(file.name, { step: 'completed', progress: 100 });
    } catch (error: any) {
      updateFileStatus(file.name, { step: 'error', error: error.message });
      throw error;
    }
  };

  return (
    <div className="mt-8 space-y-12 pb-20">
      <UserInfoDialog />
      <FileSelector onDrop={handleDrop} />

      <section className="relative">
        <AnimatePresence mode="wait">
          {!uploading ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FileUpload onDrop={handleDrop} />
            </motion.div>
          ) : (
            <motion.div
              key="progress"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="rounded-[2.5rem] border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white/50 dark:bg-zinc-950/50 backdrop-blur-3xl overflow-hidden">
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight italic">Analyse Intelligente</h2>
                        <p className="text-sm text-zinc-500">Classification de vos documents par l&apos;IA...</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full px-4 border-blue-200 text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/20">
                      {Object.values(activeFiles).filter(f => f.step === 'completed').length} / {Object.keys(activeFiles).length} Terminés
                    </Badge>
                  </div>

                  <div className="grid gap-4">
                    {Object.values(activeFiles).map((file) => (
                      <motion.div
                        key={file.name}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              file.step === 'completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                            )}>
                              {file.step === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                            </div>
                            <span className="font-bold text-sm truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            {file.step === 'waiting' && 'En attente...'}
                            {file.step === 'uploading' && 'Téléchargement...'}
                            {file.step === 'processing' && 'Préparation...'}
                            {file.step === 'analyzing' && 'Analyse IA...'}
                            {file.step === 'completed' && 'Terminé'}
                            {file.step === 'error' && 'Erreur'}
                          </span>
                        </div>
                        <Progress value={file.progress} className="h-1.5" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white flex flex-col items-center gap-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-xl border border-white/20"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold italic text-white">{dialogTitle}</DialogTitle>
              <DialogDescription className="text-blue-100 opacity-90">
                {dialogDescription}
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="secondary" className="mt-4 rounded-xl font-bold bg-white text-blue-600 hover:bg-zinc-100 shadow-lg px-8 py-6">
                Accéder au Dashboard
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {loadingFinished && documentDataList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-zinc-900 dark:bg-white rounded-2xl text-white dark:text-zinc-900 shadow-xl">
                <Wand2 className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight italic">Documents Récemment Classés</h2>
            </div>

            <div className="grid gap-6">
              {documentDataList.map((doc, idx) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="rounded-[2.5rem] border-zinc-100 dark:border-zinc-800 shadow-lg bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-8 gap-8">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-inner">
                            <FileText className="w-8 h-8" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 italic">{doc.name}</h4>
                              <Badge variant="outline" className="rounded-full border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 font-bold uppercase tracking-wider text-[10px] px-3">
                                {doc.classification}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                              <span className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                <HardDriveDownload className="w-3.5 h-3.5" />
                                {(doc.size / 1024).toFixed(1)} KB
                              </span>
                              <span className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end md:self-center">
                          <ButtonAnimation
                            url={doc.url}
                            variant="expandIcon"
                            Icon={Link}
                            iconPlacement="right"
                            className="rounded-xl border-zinc-200 dark:border-zinc-800"
                          >
                            Télécharger
                          </ButtonAnimation>

                          <Dialog>
                            <DialogTrigger asChild>
                              <ButtonAnimation
                                variant="expandIcon"
                                Icon={Eye}
                                iconPlacement="right"
                                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                              >
                                Visualiser
                              </ButtonAnimation>
                            </DialogTrigger>
                            <DialogPortal>
                              <DialogOverlay className="backdrop-blur-sm bg-black/40" />
                              <DialogContent className="max-w-5xl w-[95vw] h-[90vh] rounded-[2.5rem] border-none shadow-2xl flex flex-col overflow-hidden p-0">
                                <div className="p-6 border-b flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                                      <FileText className="w-6 h-6" />
                                    </div>
                                    <DialogTitle className="text-xl font-bold italic">{doc.name}</DialogTitle>
                                  </div>
                                  <DialogClose asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full"><AlertCircle className="rotate-45" /></Button>
                                  </DialogClose>
                                </div>
                                <div className="flex-1 min-h-0 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
                                  {doc.type.includes('pdf') ? (
                                    <iframe src={`${doc.url}#toolbar=0`} className="w-full h-full" title="PDF Preview" />
                                  ) : (
                                    <img src={doc.url} alt={doc.name} className="max-w-full max-h-full object-contain p-4" />
                                  )}
                                </div>
                                <div className="p-6 bg-white dark:bg-zinc-900 flex justify-end gap-4">
                                  <DialogClose asChild>
                                    <Button className="rounded-xl px-8 font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">Fermer</Button>
                                  </DialogClose>
                                </div>
                              </DialogContent>
                            </DialogPortal>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}