import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, ImageIcon, ShieldCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type FileUploadProps = {
  onDrop: (files: File[]) => void;
};

const FileUpload = ({ onDrop }: FileUploadProps) => {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div
        {...getRootProps()}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-[2.5rem] border-2 border-dashed transition-all duration-500 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl",
          isDragActive
            ? "border-blue-500 bg-blue-500/5 scale-[1.02] shadow-2xl shadow-blue-500/20"
            : "border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50"
        )}
      >
        <input {...getInputProps()} />

        {/* Animated background glows */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-500/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 p-12 flex flex-col items-center justify-center text-center space-y-6">
          <motion.div
            animate={isDragActive ? { y: -10, scale: 1.1 } : { y: 0, scale: 1 }}
            className={cn(
              "w-24 h-24 rounded-3xl flex items-center justify-center transition-colors duration-500",
              isDragActive ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 group-hover:bg-blue-500 group-hover:text-white"
            )}
          >
            <Upload className="w-10 h-10" />
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 italic">
              {isDragActive ? "Relâchez pour classer !" : "Importez vos documents"}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
              Glissez-déposez vos fichiers ou <span className="text-blue-500 font-bold hover:underline">parcourez votre ordinateur</span>
            </p>
          </div>

          <div className="flex items-center gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 w-full justify-center opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <FileText className="w-4 h-4 text-blue-500" />
              PDF
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <ImageIcon className="w-4 h-4 text-indigo-500" />
              Images
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Sécurisé
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-500/5 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
            >
              <div className="absolute inset-0 flex items-center justify-around overflow-hidden opacity-10">
                <Sparkles className="w-24 h-24 animate-pulse" />
                <Sparkles className="w-32 h-32 animate-pulse delay-75" />
                <Sparkles className="w-24 h-24 animate-pulse delay-150" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FileUpload;
