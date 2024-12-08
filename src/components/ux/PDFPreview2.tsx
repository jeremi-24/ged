'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

type PDFPreview2Props = {
  pdfUrl: string;
};

const PDFPreview2: React.FC<PDFPreview2Props> = ({ pdfUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadPDF = async () => {
      const loadedPdf = await pdfjsLib.getDocument(pdfUrl).promise;
      renderPage(1, loadedPdf); // Charger la première page
    };

    loadPDF();
  }, [pdfUrl]);

  const renderPage = async (pageNum: number, pdfDoc: pdfjsLib.PDFDocumentProxy) => {
    if (!canvasRef.current || !pdfDoc) return;

    const page = await pdfDoc.getPage(pageNum);
    
    // Définir une largeur fixe désirée et calculer l'échelle
    const desiredWidth = 500;
    const viewport = page.getViewport({ scale: 1 });
    const scale = desiredWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    // Configurer le canvas pour le rendu
    canvasRef.current.width = scaledViewport.width;
    canvasRef.current.height = scaledViewport.height; // hauteur réelle pour le rendu

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
    };

    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    await page.render(renderContext).promise;
  };

  return (
    <div className="flex-grow p-2">
      <div
        className="relative overflow-hidden w-full max-w-screen-md"
        style={{
          height: '200px', // Limite l'affichage du haut de la page
          width: '100%',
          maxWidth: '500px',
          overflow: 'hidden', // Masque la partie inférieure
        }}
      >
        <canvas
          ref={canvasRef}
          className="pdf-canvas border rounded-xl mx-auto"
          style={{
            width: '100%',
            height: 'auto', // Assure une échelle proportionnelle
            display: 'block',
            margin: '0 auto',
          }}
        />
      </div>
    </div>
  );
};

export default PDFPreview2;
