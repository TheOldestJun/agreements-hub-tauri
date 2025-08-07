import React from 'react';
import ReactDOM from 'react-dom/client';

import { ToastProvider } from "@heroui/react";
import App from './App';

import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider
      placement="top-center"
      toastOffset={60}
      toastProps={{
        radius: 'md',
        color: 'primary',
        variant: 'flat',
        timeout: 2000,
        hideIcon: true,
        classNames: {
          closeButton:
            'opacity-100 absolute right-4 top-1/2 -translate-y-1/2',
        },
      }}
    />
    <App />
  </React.StrictMode>,
);