import React from 'react';
import ReactDOM from 'react-dom/client';

import 'antd/dist/reset.css';
import './Assets/Style/app.css';

import App from './App';

import { AuthProvider } from './Context/AuthContext';

const rootElement = document.getElementById('root') as HTMLElement;

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider>

      <App />

    </AuthProvider>
  </React.StrictMode>
);


if ('serviceWorker' in navigator) {
  console.log('Service Workers sont pris en charge');
} else {
  console.log('Service Workers non pris en charge dans cet environnement');
}