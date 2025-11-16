import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// 1. O Bootstrap (base) vem PRIMEIRO
import 'bootstrap/dist/css/bootstrap.min.css'; 

// 2. O SEU CSS (customizado) vem DEPOIS
import './index.css'; // <-- Esta linha estava faltando ou no lugar errado
// --- FIM DA CORREÇÃO ---

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);