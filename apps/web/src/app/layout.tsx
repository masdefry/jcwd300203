'use client'

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastContainer } from 'react-toastify'
import './globals.css';
import 'react-toastify/dist/ReactToastify.css'

// imported from template in GitHub
import ScrollToTop from '@/components/common/ScrollTop';
import "../../public/assets/scss/index.scss"
import { Provider } from 'react-redux';
import {store} from "./store/store"
import ReactQueryProvider from '../providers/TanstackProvider';
import AuthProvider from '../providers/AuthProvider';
import React from 'react';

if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Nunito:400,400i,500,600,700&display=swap" />
        <link rel="icon" href="./favicon.ico" />
      </head>

      <body className={inter.className}>
        <Provider store={store}>
          <AuthProvider>
            <ReactQueryProvider>
            {children}
            </ReactQueryProvider>
          </AuthProvider>
          <ToastContainer />
        </Provider>
        <ScrollToTop/>
      </body>
    </html>
  );
}
