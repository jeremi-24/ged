import React, { useState } from 'react';

type UserInfoPushProps = {
  userFormData: { numero: string;  }; 
};

const UserInfoPush = ({ userFormData }: UserInfoPushProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      
      await new Promise((resolve) => setTimeout(resolve, 2000));

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

      {}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex justify-between items-center">
          <label className="font-medium text-gray-700">Numéro :</label>
          <p className="text-blue-600 font-medium">{userFormData.numero}</p>
        </div>
        
      </div>

      {}
      {error && <p className="text-red-500 text-center font-medium">{error}</p>}

      {}
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
