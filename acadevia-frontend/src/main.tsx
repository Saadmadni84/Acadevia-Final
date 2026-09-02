import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './config/i18n.config';

import { executeClass10Simulation } from './services/class10Simulation.service';

if (import.meta.env.DEV) {
  (window as any).simulateClass10 = () => {
    const res = executeClass10Simulation();
    console.log('Class 10 simulation completed successfully:', res);
    return res;
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
