import Tesseract from 'tesseract.js';

type OCRImagesOptions = {
  onProgress?: (progress: { current: number; total: number }) => void;
  onStart?: (progress: { current: number; total: number }) => void;
};

const OCRImages = async (urls: string[], options?: OCRImagesOptions): Promise<Record<string, string>> => {
  
  if (options?.onStart) {
    options.onStart({ current: 0, total: urls.length });
  }

  const progress = { total: urls.length, current: 0 };

  const promises = urls.map(async (url) => {
    const { data: { text } } = await Tesseract.recognize(url, 'isl');
    progress.current += 1;

    if (options?.onProgress) {
      options.onProgress(progress);
    }

    return text;
  });

  const texts = await Promise.all(promises);

  return texts.reduce((acc, text, index) => {
    acc[index + 1] = text; 
    return acc;
  }, {} as Record<string, string>);
};

export default OCRImages;
