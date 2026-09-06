# Historial de Versiones (Changelog)

Todas las actualizaciones notables de la Suite de Terapia Visual se documentarán en este archivo.

## [v7.02] - Plan de Pruebas QA y Homogeneización
* **Añadido:** Matriz y plan formal de pruebas QA ([QA_Test_Plan.md](file:///Users/aejara/Documents/GitHub/terapia-visual-nistagmo/QA_Test_Plan.md)).
* **Cambiado:** Homogeneización de la versión `v7.02` y actualización del nombre de caché del Service Worker (`CACHE_NAME = 'terapia-visual-v7.02'`) en toda la suite.

## [v7.01] - Hotfix y Estabilización PWA
* **Fijado:** Resolución del problema de caché agresiva del *Service Worker* (`sw.js`). Se ha implementado el borrado automático de cachés antiguas en la fase de activación (`self.clients.claim()`).
* **Fijado:** Salvaguardas añadidas en `app.js` (`window.renderPatientArea`, `window.renderAdminDashboard`) para evitar que la transición de roles falle al recargar la aplicación offline.

## [v7.00] - Rediseño Clínico y Roles
* **Añadido:** Sistema de ruteo visual para separar el "Área del Paciente" (Entrenamiento) del "Área de Administración" (Optometrista).
* **Añadido:** Diccionario Clínico integrado con botones informativos ("ℹ️ Info") en cada tarjeta, explicando la justificación optométrica del juego para nistagmo y ambliopía.
* **Cambiado:** Interfaz de usuario del paciente rediseñada con tarjetas horizontales.
* **Cambiado:** Fondo general de la aplicación actualizado a gris medio fotográfico (`#808080`) para minimizar la fatiga visual y mejorar el contraste de los estímulos.

## [v6.00 - v6.01] - IndexedDB, PWA y Gamificación
* **Añadido:** Transformación completa a Progressive Web App (PWA) con `manifest.json` y `sw.js`. Instalación nativa y soporte 100% offline.
* **Añadido:** Generador Automático de Pautas basado en algoritmos de tiempo (ej. 15 minutos) y enfoque de lateralidad (BIN, OD, OI).
* **Añadido:** Motor de gamificación con cálculo automático de Rachas Diarias (*Streaks*).
* **Añadido:** 2 nuevos juegos clínicos: *Parches de Gabor* (Sensibilidad al contraste en V1) y *Acomodación Dinámica / Trombón* (Flexibilidad ciliar en eje Z).
* **Cambiado:** Migración estructural de `localStorage` (límite de 5MB) a la base de datos asíncrona nativa `IndexedDB` para almacenamiento ilimitado.

## [v5.00 - v5.05] - Arquitectura Modular
* **Cambiado:** Refactorización crítica del monolito (HTML único) a una arquitectura de 4 ficheros (`index.html`, `styles.css`, `app.js`, `juegos.js`) para garantizar la mantenibilidad del código.
* **Cambiado:** Independización de los 3 modos de Cuadrícula Espacial (Búsqueda, Coordenadas, Seguimiento) como juegos separados en la interfaz y en la base de datos.
* **Añadido:** Rediseño del motor de impresión PDF para desglosar resultados en bloques individuales por juego, inyectando gráficas vectoriales (SVG) de forma dinámica.
* **Fijado:** Restauración del motor de Síntesis de Voz (Web Speech API) y controles del teclado virtual.

## [v4.00 - v4.07] - Expansión de la Suite
* **Añadido:** 5 nuevos juegos terapéuticos: Anti-Crowding, Saltos Sacádicos, Pelota de Marsden, Visual Tracing (Laberintos) y Taquistoscopio.
* **Añadido:** Soporte universal de navegación por teclado físico y flechas direccionales.
* **Cambiado:** Reescritura del motor de tiempo activo (pausa automática del cronómetro durante la lectura de instrucciones).

## [v1.00 - v3.08] - Fundaciones Clínicas
* **Añadido:** Módulo inicial de Cuadrícula Espacial para fijación excéntrica.
* **Añadido:** Sistema multiusuario basado en `localStorage`.
* **Añadido:** Algoritmo de calibración física por tarjeta de crédito para calcular pulgadas de pantalla y distancia recomendada en centímetros.
* **Añadido:** Modo de Alto Contraste adaptado para monitores e-Ink (Kindle Scribe).
* **Añadido:** Exportación e importación de la base de datos en formato `.json`.