import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

type IdUploadProps = {
  onDrop: (file: File) => void; 
};

const IdUpload = ({ onDrop }: IdUploadProps) => {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles[0]); 
      }
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: {
      "image/*": [] 
    },
    maxFiles: 1 
  });

  return (
    <div className="rounded-lg p-1">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 transition-all duration-300 max-w-[760px] h-48 flex flex-col items-center justify-center ${isDragActive ? "border-blue-500 bg-blue-100" : "bg-slate-100"}`}>
        <input {...getInputProps()} />
        <Upload className={`w-12 h-12 mb-4 text-gray-500 transition-transform duration-300 ${isDragActive ? "transform scale-150 text-blue-600" : ""}`} />
        {isDragActive ? (
          <p className="text-center text-blue-600">Déposez votre photo de carte ici ...</p>
        ) : (
          <p className="text-center text-gray-600">Faites glisser une photo ou cliquez pour sélectionner</p>
        )}
      </div>
    </div>
  );
};

export default IdUpload;
