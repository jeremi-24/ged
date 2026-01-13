import { useEffect, useRef } from "react";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface DocumentPreviewProps {
  documentUrl: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ documentUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      const loadingTask = pdfjs.getDocument(documentUrl);
      const pdf = await loadingTask.promise;

      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });

      if (canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        canvasRef.current.width = viewport.width;
        canvasRef.current.height = viewport.height;

        const renderContext = {
          canvasContext: context!,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      }
    };

    loadPdf();
  }, [documentUrl]);

  return (
    <div className="overflow-auto border rounded" style={{ height: '500px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default DocumentPreview;
