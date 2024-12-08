// lib/pdfToImages.ts
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import 'pdfjs-dist/legacy/build/pdf.worker.mjs'; // Importer le worker ici

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

type PDFToImagesOptions = {
  scale?: number;
  onProgress?: (progress: { current: number; total: number }) => void;
  onStart?: (progress: { current: number; total: number }) => void;
};

const pdfToImages = async (pdf: string, options?: PDFToImagesOptions): Promise<string[]> => {
  const output: string[] = [];
  try {
    const doc = await pdfjsLib.getDocument(pdf).promise;

    const totalPages = doc.numPages;

    if (options?.onStart) {
      options.onStart({ current: 0, total: totalPages });
    }

    for (let i = 1; i <= totalPages; i++) {
      const canvas = document.createElement('canvas');
      const page = await doc.getPage(i);
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      const viewport = page.getViewport({ scale: options?.scale || 1 });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;

      if (options?.onProgress) {
        options.onProgress({ current: i, total: totalPages });
      }

      output.push(canvas.toDataURL('image/png'));
    }
  } catch (error) {
    console.error('Error while converting PDF to images:', error);
  }
  return output;
};

export default pdfToImages;
