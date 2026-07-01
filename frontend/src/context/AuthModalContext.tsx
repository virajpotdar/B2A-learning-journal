import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type AuthModal = 'login' | 'register' | null;

interface AuthModalContextValue {
  modal: AuthModal;
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue>({
  modal: null,
  openLogin: () => {},
  openRegister: () => {},
  closeModal: () => {},
});

export const useAuthModal = () => useContext(AuthModalContext);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<AuthModal>(null);

  const openLogin = useCallback(() => setModal('login'), []);
  const openRegister = useCallback(() => setModal('register'), []);
  const closeModal = useCallback(() => setModal(null), []);

  return (
    <AuthModalContext.Provider value={{ modal, openLogin, openRegister, closeModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}
