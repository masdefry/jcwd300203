'use client';

import type { Metadata } from 'next';
import { Inter, Nunito } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import Header from '@/components/home/Header';
import MobileMenu from '@/components/common/header/MobileMenu';
// imported from template in GitHub
import ScrollToTop from '@/components/common/ScrollTop';
import '../../public/assets/scss/index.scss';
import { Provider } from 'react-redux';
import { store } from './store/store';
import ReactQueryProvider from '../providers/TanstackProvider';
import AuthProvider from '../providers/AuthProvider';
import React from 'react';
import Navbar from '@/components/Header';
import Script from 'next/script';

if (typeof window !== 'undefined') {
  require('bootstrap/dist/js/bootstrap');
}

const inter = Inter({ subsets: ['latin'] });

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-nunito', // This creates a CSS variable
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable}`}>
      <head>
        <link rel="icon" href="./favicon.ico" />
        {/* Include Midtrans Snap script */}
        <Script
          type="text/javascript"
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key="SB-Mid-client-Qu-bODSBhUtjUUQM"
          strategy="beforeInteractive"
        />
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyBv-2SIB61t1CMsdbE3sU64zZSefhjdNiA&libraries=places`}
          strategy="afterInteractive"
          onLoad={() => console.log('Google Maps loaded')}
          onError={(e) => console.error('Error loading Google Maps:', e)}
        />
      </head>

      <body className={inter.className}>
        <Provider store={store}>
          <AuthProvider>
            <ReactQueryProvider>
              <Navbar />
              {children}
            </ReactQueryProvider>
          </AuthProvider>
          <ToastContainer />
        </Provider>
        <ScrollToTop />
      </body>
    </html>
  );
}
