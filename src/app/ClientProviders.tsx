'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <Provider store={store}>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </Provider>
  );
}
