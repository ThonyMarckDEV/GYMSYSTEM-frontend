import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/oscuro.css';
import { aplicarTema, obtenerTema } from 'utilities/Tema/tema';
import App from './App'; // <-- Tu import original
import reportWebVitals from './reportWebVitals';

// El tema se aplica antes de pintar la app (sin parpadeo de claro a oscuro)
aplicarTema(obtenerTema());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

reportWebVitals();