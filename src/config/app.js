// src/config/app.js
// -----------------------------------------------------------------------
// Nombre del SISTEMA (el producto/software), NO de una empresa cliente.
// Cada empresa (gimnasio) tiene su propio nombre, que se muestra en el sidebar.
// Se puede sobrescribir con REACT_APP_NAME en el .env
// -----------------------------------------------------------------------

export const APP_NAME = process.env.REACT_APP_NAME || 'GYM SYSTEM';
