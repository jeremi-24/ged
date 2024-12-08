import React, { useState } from 'react';

type UserInfoPushProps = {
  userFormData: { numero: string; nom: string; prenom: string }; // Données à afficher
};

const UserInfoPush = ({ userFormData }: UserInfoPushProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour simuler l'envoi des informations
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Simuler une attente (remplacer par l'appel à une API ou à Firestore)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Ici, on simule l'envoi réussi des données
      console.log('Informations envoyées :', userFormData);
      setIsSubmitting(false);
    } catch (err) {
      setError('Une erreur est survenue, veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto  rounded-lg shadow-md space-y-6">
      
      <p className="text-center text-gray-600 mb-6">
        Merci de vérifier les informations suivantes avant de finaliser.
      </p>

      {/* Affichage des informations de l'utilisateur */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex justify-between items-center">
          <label className="font-medium text-gray-700">Numéro :</label>
          <p className="text-blue-600 font-medium">{userFormData.numero}</p>
        </div>
        <div className="flex justify-between items-center">
          <label className="font-medium text-gray-700">Nom :</label>
          <p className="text-blue-600 font-medium">{userFormData.nom}</p>
        </div>
        <div className="flex justify-between items-center">
          <label className="font-medium text-gray-700">Prénom :</label>
          <p className="text-blue-600 font-medium">{userFormData.prenom}</p>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && <p className="text-red-500 text-center font-medium">{error}</p>}

      {/* Bouton de soumission */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-lg text-white text-lg ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSubmitting ? 'Envoi en cours...' : 'Finaliser'}
        </button>
      </div>
    </div>
  );
};

export default UserInfoPush;
