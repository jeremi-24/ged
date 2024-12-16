import React, { useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';

// Fonction pour nettoyer et extraire les informations spécifiques
const extractInformation = (text: string) => {
  const cleanedText = text.replace(/[\n\r\t—™®~:]/g, ' ').replace(/\s{2,}/g, ' ').trim();
  const numeroMatch = cleanedText.match(/Numéro\s*[:\-]?\s*(\d{4}-\d{3}-\d{4}|\d{11})/i);

  return {
    numero: numeroMatch ? numeroMatch[1] : ''
  };
};

type OrcFillFormProps = {
  imageUrl: string; // L'URL de l'image pour l'OCR
  onUserFormDataChange: (data: { numero: string }) => void; // Fonction de mise à jour des données
};

const OrcFillForm = ({ imageUrl, onUserFormDataChange }: OrcFillFormProps) => {
  const [userFormData, setUserFormData] = useState({
    numero: ''
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Définir processOCR en dehors de useEffect pour ne pas la mettre dans les dépendances
  const processOCR = (url: string) => {
    setIsProcessing(true);
    Tesseract.recognize(url, 'fra')
      .then(({ data: { text } }) => {
        const extracted = extractInformation(text);
        setUserFormData(extracted);
        onUserFormDataChange(extracted);
        setIsProcessing(false);
      })
      .catch(() => {
        setIsProcessing(false);
      });
  };

  useEffect(() => {
    if (imageUrl) {
      processOCR(imageUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  // Fonction pour gérer les changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedData = {
      ...userFormData,
      [name]: value
    };
    setUserFormData(updatedData);
    onUserFormDataChange(updatedData); // Mettre à jour le parent avec les nouvelles données
  };

  return (
    <div className="p-4 rounded-lg">
      {/* Affichage de l'indicateur de chargement pendant le traitement OCR */}
      {isProcessing ? (
        <div className="flex justify-center items-center">
          <div className="spinner-border animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <form className="space-y-4 mt-4">
          <div>
            <label htmlFor="numero" className="block text-sm font-medium text-gray-700">Numéro</label>
            <input
              id="numero"
              name="numero"
              type="text"
              value={userFormData.numero}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Numéro"
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default OrcFillForm;
