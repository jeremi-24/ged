'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

type PDFPreviewProps = {
  pdfUrl: string;
};

const PDFPreview: React.FC<PDFPreviewProps> = ({ pdfUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1); // Échelle initiale à 1 pour éviter les décalages

  // Charger le PDF
  useEffect(() => {
    const loadPDF = async () => {
      const loadedPdf = await pdfjsLib.getDocument(pdfUrl).promise;
      setPdf(loadedPdf);
      setNumPages(loadedPdf.numPages);
      renderPage(1, loadedPdf); // Charger la première page
    };

    loadPDF();
  }, [pdfUrl]);

  const renderPage = async (pageNum: number, pdfDoc: pdfjsLib.PDFDocumentProxy) => {
    if (!canvasRef.current || !pdfDoc) return;

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.height = viewport.height;
    canvasRef.current.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    await page.render(renderContext).promise;
  };

  // Fonctions de navigation de pages
  const handleNextPage = () => {
    if (pageNum < numPages) {
      setPageNum(pageNum + 1);
      if (pdf) renderPage(pageNum + 1, pdf);
    }
  };

  const handlePreviousPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1);
      if (pdf) renderPage(pageNum - 1, pdf);
    }
  };

  // Fonctions de zoom
  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3)); // Limite le zoom à 3x
    if (pdf) renderPage(pageNum, pdf);
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5)); // Réduit le zoom à 0.5x minimum
    if (pdf) renderPage(pageNum, pdf);
  };

  return (
    <div className="pdf-preview-container flex flex-col items-center h-full">
      {/* Contrôles de navigation et de zoom */}
      <div className="flex gap-2 mt-2 mr-8 mb-1">
        <button
          onClick={handlePreviousPage}
          disabled={pageNum <= 1}
          className="bg-blue-500 text-white p-2 rounded-md disabled:bg-gray-400"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={handleNextPage}
          disabled={pageNum >= numPages}
          className="bg-blue-500 text-white p-2 rounded-md disabled:bg-gray-400"
        >
          <ChevronRight size={24} />
        </button>

        <button
          onClick={handleZoomOut}
          className="bg-gray-300 text-black p-2 rounded-md"
        >
          <ZoomOut size={24} />
        </button>

        <button
          onClick={handleZoomIn}
          className="bg-gray-300 text-black p-2 rounded-md"
        >
          <ZoomIn size={24} />
        </button>
      </div>

      {/* Conteneur du PDF */}
      <div className="relative overflow-auto w-full max-w-screen-md">
        {/* Utiliser des marges auto pour centrer le canvas */}
        <canvas
          ref={canvasRef}
          className="pdf-canvas border rounded-lg mx-auto"
          style={{
            width: '100%',
            height: 'auto', // Laisser la hauteur se recalculer selon la largeur
            maxWidth: '100%',
            display: 'block',
            margin: '0 auto',
          }}
        />
      </div>

      <div className="mt-2 text-gray-700">
        Page {pageNum} sur {numPages}
      </div>
    </div>
  );
};

export default PDFPreview;
