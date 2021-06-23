import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { auth, firebase } from '../services/firebase';

interface User {
  avatar: string;
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | void;
  signInWithGoogle: () => Promise<void>;
}

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextType);

export default function AuthContextProvider({
  children,
}: AuthContextProviderProps) {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (!authUser) return;

      const { displayName, photoURL, uid } = authUser;

      if (!displayName || !photoURL) {
        throw new Error('Missing user information from Google account.');
      }

      setUser({ id: uid, name: displayName, avatar: photoURL });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    const res = await auth.signInWithPopup(provider);
    if (!res.user) return;

    const { displayName, photoURL, uid } = res.user;

    if (!displayName || !photoURL) {
      throw new Error('Missing user information from Google account.');
    }

    setUser({ id: uid, name: displayName, avatar: photoURL });
  }, []);

  return (
    <AuthContext.Provider value={{ signInWithGoogle, user }}>
      {children}
    </AuthContext.Provider>
  );
}
