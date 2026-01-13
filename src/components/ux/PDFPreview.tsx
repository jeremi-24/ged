'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, MousePointer2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

type PDFPreviewProps = {
  pdfUrl: string;
};

const PDFPreview: React.FC<PDFPreviewProps> = ({ pdfUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);

  const renderPage = useCallback(async (num: number, pdfDoc: pdfjsLib.PDFDocumentProxy, currentScale: number) => {
    if (!canvasRef.current || !pdfDoc) return;
    setLoading(true);

    try {
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: currentScale });
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      const devicePixelRatio = window.devicePixelRatio || 1;
      canvasRef.current.height = viewport.height * devicePixelRatio;
      canvasRef.current.width = viewport.width * devicePixelRatio;
      canvasRef.current.style.height = `${viewport.height}px`;
      canvasRef.current.style.width = `${viewport.width}px`;

      context.scale(devicePixelRatio, devicePixelRatio);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      await page.render(renderContext).promise;
    } catch (error) {
      console.error("PDF render error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadPDF = async () => {
      setLoading(true);
      try {
        const loadedPdf = await pdfjsLib.getDocument(pdfUrl).promise;
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setPageNum(1);
        renderPage(1, loadedPdf, scale);
      } catch (error) {
        console.error("PDF load error:", error);
      }
    };

    loadPDF();
  }, [pdfUrl, renderPage, scale]);

  const handlePageChange = (delta: number) => {
    const newPage = Math.min(Math.max(pageNum + delta, 1), numPages);
    if (newPage !== pageNum && pdf) {
      setPageNum(newPage);
      renderPage(newPage, pdf, scale);
    }
  };

  const handleZoom = (delta: number) => {
    const newScale = Math.min(Math.max(scale + delta, 0.5), 3);
    if (newScale !== scale && pdf) {
      setScale(newScale);
      renderPage(pageNum, pdf, newScale);
    }
  };

  return (
    <div className="relative group flex flex-col h-full bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden shadow-inner">
      {}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 p-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        <div className="flex items-center gap-1 border-r border-zinc-200 dark:border-zinc-800 pr-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-xl hovrer:bg-zinc-100"
            onClick={() => handlePageChange(-1)}
            disabled={pageNum <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-[10px] font-bold px-2 pointer-events-none tabular-nums">
            {pageNum} / {numPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-xl hovrer:bg-zinc-100"
            onClick={() => handlePageChange(1)}
            disabled={pageNum >= numPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 pl-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-xl"
            onClick={() => handleZoom(-0.25)}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-[10px] font-bold px-1 tabular-nums w-12 text-center pointer-events-none">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-xl"
            onClick={() => handleZoom(0.25)}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-auto scrollbar-hide flex items-start justify-center p-8 pt-16">
        <div className={cn(
          "relative transition-opacity duration-300",
          loading ? "opacity-40" : "opacity-100"
        )}>
          <canvas
            ref={canvasRef}
            className="shadow-2xl rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {}
      <div className="p-3 bg-white/50 dark:bg-black/20 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-6">
        <div className="flex items-center gap-2">
          <MousePointer2 className="w-3 h-3" />
          Interactions activées
        </div>
        <div className="flex items-center gap-2">
          <Maximize2 className="w-3 h-3 cursor-pointer hover:text-zinc-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
