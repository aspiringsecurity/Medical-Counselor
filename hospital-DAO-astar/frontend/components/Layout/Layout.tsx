import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAtomValue, useSetAtom } from 'jotai';
import { ToastContainer } from 'react-toastify';
import { Header } from 'components/Header';
import { Sidebar } from 'components/Sidebar';
import { CloseButton } from 'components/ui-kit/Notifications';

import {
  currentUserAtom,
  setCurrentUserAtom,
  USER_STORAGE_KEY
} from 'store/db';
import styles from './Layout.module.scss';

export interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const user = useAtomValue(currentUserAtom);
  const setUser = useSetAtom(setCurrentUserAtom);
  const router = useRouter();

  useEffect(() => {
    if (user) return;
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedUser) {
      if (router.pathname === '/login') return;
      router.push('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router, user, setUser]);

  return (
    <>
      <Header />
      <Sidebar />
      <main className={styles.root}>{children}</main>
      <ToastContainer
        position="top-right"
        icon={false}
        autoClose={3000}
        hideProgressBar
        pauseOnFocusLoss
        pauseOnHover
        closeOnClick={false}
        rtl={false}
        newestOnTop={false}
        draggable={false}
        closeButton={CloseButton}
      />
    </>
  );
}
