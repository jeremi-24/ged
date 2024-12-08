import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";


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
      'image/*': []
    }
  });

  return (
   <div className=" rounded-lg p-1">
    <div className="">
    <div
      {...getRootProps()}
      className={`border-2  border-dashed rounded-lg p-6 transition-all duration-300 max-w-[760px] h-48 flex flex-col items-center justify-center  ${
        isDragActive ? "border-blue-500 w-[760px] bg-blue-100" : " bg-slate-100"
      }`}
    >
      <input {...getInputProps()} />
      <Upload
        className={`w-12 h-12 mb-4  text-gray-500 transition-transform duration-300 ${
          isDragActive ? "transform scale-150 text-blue-600" : ""
        }`} // Zoom effect and color change
      />
      {isDragActive ? (
        <p className="text-center text-green-600">Déposez vos fichiers ici ...</p>
      ) : (
        <p className="text-center text-gray-600">Faites glisser des fichiers ou cliquez pour sélectionner</p>
      )}
    </div>
   </div>
   </div>
  );
};

export default FileUpload;
