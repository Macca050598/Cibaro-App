import { useEffect } from 'react';
import { Redirect, useRouter, useSegments, Stack } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../configs/FirebaseConfig';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to home
        router.replace('/(tabs)/home');
        // router.replace('/auth/householdForm');

      } else {
        // No user is signed in, redirect to landing
        router.replace('/Landing');
                // router.replace('/auth/householdForm');

      }
    });

    return () => unsubscribe();
  }, []);

}