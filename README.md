# 👁️ Suite de Terapia Visual Clínica (v7.00)

> **Software clínico web integral para entrenamiento oculomotor, estabilización de la mirada y agudeza visual**, diseñado específicamente para la rehabilitación optométrica en pacientes con nistagmo, ambliopía, déficits de fijación foveal, alteraciones de seguimiento y sacádicos.

---

## 📋 Descripción del Proyecto

Esta aplicación funciona como una **Suite Clínica (PWA - Progressive Web App)** que permite a optometristas y terapeutas visuales gestionar perfiles de pacientes, recetar pautas terapéuticas, automatizar rutinas y ejecutar **10 módulos de entrenamiento visual distintos**. 

La aplicación se adapta automáticamente a cualquier pantalla (Mac, PC, Tablets y dispositivos e-Ink como Kindle Scribe), calculando la distancia clínica recomendada mediante calibración por tarjeta física. Todo el procesamiento de datos y la generación de informes se realizan de forma local y offline mediante `IndexedDB`, garantizando total privacidad clínica (GDPR / HIPAA compliance).

---

## 🎮 Catálogo de Ejercicios Clínicos (10 Módulos)

1. **🔠 Búsqueda Táctil:** Localización foveal entre distractores. Ayuda a estabilizar la fijación excéntrica.
2. **🗺️ Coordenadas:** Discriminación de cuadrantes espacial e integración visomotora.
3. **🏃 Seguimiento (Pursuit):** Rastreo de un objetivo dinámico foveal en la matriz para reducir latencias.
4. **🎯 Anti-Crowding:** Entrenamiento contra el amontonamiento visual, estimulando la agudeza visual resolutiva central (clave en ambliopía).
5. **⚡ Saltos Sacádicos:** Entrenamiento de reflejo periférico y fijación foveal ultrarrápida.
6. **🎾 Pelota de Marsden:** Simulador pendular para entrenamiento de seguimiento dinámico suave en el espacio libre.
7. **🔀 Visual Tracing (Laberintos):** Estabilización de la mirada discriminando trayectorias continuas sin apoyo motor.
8. **📸 Taquistoscopio:** Memoria visual flash (250ms). Evita que el paciente con nistagmo tenga tiempo de realizar movimientos oscilatorios lentos.
9. **🦓 Parches de Gabor:** Estimulación específica de la sensibilidad al contraste direccional en las neuronas de la corteza visual primaria (V1).
10. **🎺 Acomodación Dinámica (Trombón):** Flexibilidad ciliar y *rock* acomodativo simulando acercamientos y alejamientos en el eje Z.

---

## ✨ Funcionalidades Principales

* **Sistema de Roles (Paciente / Clínica):** Interfaces separadas para evitar sobrecarga de información al paciente durante el entrenamiento libre.
* **Gestión de Pacientes (IndexedDB):** Base de datos asíncrona ilimitada en el navegador. Creación, edición, borrado absoluto y persistencia de historiales.
* **Auto-Pautas Inteligentes:** Generador algorítmico de rutinas que, introduciendo el tiempo deseado y el ojo a tratar, diseña una sesión combinando terapia monocular y binocular.
* **Gamificación Clínica:** Sistema automático de cálculo de **Rachas Diarias (Streaks)** para potenciar la adherencia al tratamiento.
* **Reportes Clínicos PDF:** Generador de informes en A4, agrupando el desempeño por juegos con métricas y gráficas de evolución vectorial (SVG).
* **Marca Blanca:** Personalización de reportes con Nombre de Clínica, Especialista, Nº Colegiado y Logo (Base64).
* **Portabilidad y Copias de Seguridad:** Exportación e importación de la base de datos completa en un único archivo `.json`.

---

## 🏗️ Arquitectura Técnica (Multifichero PWA)

El proyecto está construido en **Vanilla HTML5, CSS3 y JavaScript ES6+**, sin frameworks ni dependencias externas (*Backend-less*):

* `index.html`: Estructura DOM de la SPA, modales de interfaz y overlays.
* `styles.css`: Sistema de diseño, variables, Dark Mode / e-Ink y reglas `@media print`.
* `app.js`: Motor clínico. Control de IndexedDB, Router de roles, generador de pautas y renderizado de gráficas SVG/PDF.
* `juegos.js`: Motor gráfico (Game Loops), calibración de hardware, Teclado Virtual interactivo y síntesis de voz (TTS).
* `manifest.json` & `sw.js`: Archivos de infraestructura PWA para instalación nativa y funcionamiento 100% offline.

---

## 🚀 Instalación y Despliegue

### Opción A: Progressive Web App (Recomendada)
1. Aloja los archivos en un servidor web estático (ej. GitHub Pages).
2. Abre la URL en el navegador de tu dispositivo (PC, Mac, iOS, Android).
3. Haz clic en "Instalar Aplicación" o "Añadir a la pantalla de inicio". El *Service Worker* cacheará la suite para funcionar sin internet.

### Opción B: Ejecución Local
1. Descarga el repositorio.
2. Abre `index.html` en cualquier navegador moderno. 

---

## 📜 Historial de Versiones (Changelog)

### v7.00 (Rediseño Clínico y Roles)
* Refactorización de la interfaz en dos áreas aisladas: Área del Paciente (Entrenamiento y Gamificación) y Área de Administración (Optometrista).
* Rediseño del Área del Paciente con tarjetas horizontales y métricas de desempeño en tiempo real.
* Añadido el "Diccionario Clínico": Botones informativos en cada juego explicando la justificación optométrica y su relación con el nistagmo/ambliopía.
* Cambio a paleta de color gris medio fotográfico (`#808080`) para maximizar el contraste de los estímulos terapéuticos.
* Refinamiento de la lógica de ruteo y limpieza de vistas modulares.

### v6.00 - v6.01 (PWA, IndexedDB y Auto-Pautas)
* **Transformación a PWA:** Implementación de `manifest.json` y `sw.js` para instalación nativa y soporte offline puro.
* **Migración de Base de Datos:** Sustitución de `localStorage` (límite de 5MB) por `IndexedDB` (almacenamiento asíncrono ilimitado). Migración automática de datos heredados.
* Añadidos 2 nuevos juegos clínicos: Parches de Gabor y Acomodación Dinámica (Trombón), alcanzando los 10 módulos.
* Implementación del motor de Gamificación (Cálculo automático de rachas diarias).
* Implementación del Generador Automático de Pautas basado en tiempo y lateralidad (BIN, OD, OI).

### v5.00 - v5.05 (Arquitectura Modular Multifichero)
* Refactorización crítica del código monolítico hacia una arquitectura de 4 ficheros (`index.html`, `styles.css`, `app.js`, `juegos.js`) para asegurar la integridad del código y facilitar la escalabilidad.
* Independización de los modos de Cuadrícula Espacial (Búsqueda, Coordenadas, Seguimiento) como juegos separados, pasando de 6 a 8 tarjetas.
* Rediseño completo del motor de impresión PDF: ahora desglosa los resultados en bloques individuales por juego con sus respectivas gráficas SVG.
* Restauración y estabilización del sistema de Síntesis de Voz (TTS) y Teclado Virtual con navegación por flechas.

### v4.00 - v4.07 (Expansión de la Suite)
* Transformación de un único juego (Cuadrícula) a una suite de 6 módulos (Anti-Crowding, Sacádicos, Marsden, Laberintos y Taquistoscopio).
* Reescritura del motor de tiempo activo (pausas automáticas en tiempos muertos).
* Soporte universal de navegación por teclado físico (flechas direccionales e Intro) para todos los juegos de agudeza visual.
* Corrección de mecánicas de aleatoriedad (Laberintos) y progresión de rondas en caso de fallo (Taquistoscopio).

### v1.00 - v3.08 (Fundaciones Clínicas)
* Lanzamiento de la Cuadrícula Espacial.
* Desarrollo del motor multiusuario en `localStorage`.
* Implementación de la calibración física de pantalla por tarjeta (cálculo de densidad de píxeles y distancia sugerida).
* Soporte para pantallas e-Ink (Modo Alto Contraste).
* Motor de inyección de gráficas SVG de evolución y exportación/importación JSON.
* Generador de PDF con membrete clínico personalizable (Marca Blanca con Logo en Base64).