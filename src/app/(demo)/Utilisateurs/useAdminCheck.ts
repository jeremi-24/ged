'use client'
import { useEffect, useState } from 'react';
import { auth, firestore } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setIsAdmin(userData?.role === 'admin');
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  return { isAdmin, authLoading };
}
