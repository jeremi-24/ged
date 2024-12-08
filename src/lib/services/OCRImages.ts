import Tesseract from 'tesseract.js';

type OCRImagesOptions = {
  onProgress?: (progress: { current: number; total: number }) => void;
  onStart?: (progress: { current: number; total: number }) => void;
};

const OCRImages = async (urls: string[], options?: OCRImagesOptions): Promise<Record<string, string>> => {
  // Vérifie si onStart est défini avant de l'appeler
  if (options?.onStart) {
    options.onStart({ current: 0, total: urls.length });
  }

  const progress = { total: urls.length, current: 0 };

  // Utilisation d'un tableau de promesses pour la reconnaissance OCR
  const promises = urls.map(async (url) => {
    const { data: { text } } = await Tesseract.recognize(url, 'isl');
    progress.current += 1;

    // Vérifie si onProgress est défini avant de l'appeler
    if (options?.onProgress) {
      options.onProgress(progress);
    }

    return text;
  });

  const texts = await Promise.all(promises);

  // Réduit les résultats pour les retourner sous forme d'objet
  return texts.reduce((acc, text, index) => {
    acc[index + 1] = text; // Utilise une affectation directe
    return acc;
  }, {} as Record<string, string>);
};

export default OCRImages;
