"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const GoogleAuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');

    if (accessToken) {
      sessionStorage.setItem('googleAccessToken', accessToken);
      router.push('/documents/nouveau_document'); 
    } else {
      console.error('Access token not found in URL hash');
    }
  }, [router]);

  return <p>Authentification en cours...</p>;
};

export default GoogleAuthCallback;
