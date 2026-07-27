# 👁️ Terapia Visual: Estabilización Táctil y Fijación Foveal

> **Software web de entrenamiento oculomotor y estabilización de la mirada**, diseñado específicamente para pacientes con nistagmo, ambliopía, déficits de fijación foveal o alteraciones de seguimiento y sacádicos.

---

## 📋 Descripción del Proyecto

Esta aplicación web interactiva permite a optometristas, terapeutas visuales y pacientes realizar ejercicios de fijación, rastreo visual sacádico y seguimiento dinámico. El software se adapta automáticamente a cualquier pantalla (Mac, PC, iPads/Tablets y dispositivos e-Ink como Amazon Kindle Scribe) calculando la distancia clínica recomendada según el tamaño físico del monitor y las letras en pantalla.

---

## ✨ Características Principales

* **3 Modos de Entrenamiento Clínico:**
  1. **Búsqueda Foveal:** Tocar objetivos específicos dentro de una cuadrícula alfanumérica de 10x10.
  2. **Lectura de Coordenadas:** Localización de celdas por Fila/Columna con entrada directa de teclado virtual/físico.
  3. **Seguimiento Dinámico:** Rastreo de un objetivo móvil con discriminación de caracteres para fijación continua.
* **Calibración Física Exacta:**
  * Detector automático de pulgadas y tipo de pantalla.
  * Herramienta de calibración milimétrica mediante tarjeta física (crédito/carné).
  * Cálculo dinámico de distancia sugerida de trabajo (en cm).
* **Adaptabilidad e-Ink y Accesibilidad:**
  * Modo **Alto Contraste / e-Ink** (blanco y negro puro) auto-activado en e-Readers.
  * Tipografía clínica legible (*Atkinson Hyperlegible*).
  * Auto-focus y scroll suave al tablero de juego.
  * Resumen flotante de aciertos y tiempos al finalizar cada ronda.
* **Gestión Multiusuario y Pautas Terapéuticas:**
  * Perfiles de pacientes individuales con historiales y estadísticas aisladas.
  * Diseñador de prescripciones diarias ("Plan del Día") con ejecución guiada en un clic.
* **Informes Clínicos y Marca Blanca:**
  * Personalización del centro: Nombre del Centro, Especialista, Nº de Colegiado, Contacto y Logo.
  * Generador de **Reportes PDF Documentales A4** de 1 sola página.
  * Impresión de hojas de trabajo analógicas para lápiz y papel.
  * Copias de seguridad completas en formato `.json` (importación/exportación).

---

## 📜 Historial de Versiones (Changelog)

### 🚀 Rama 3.xx / 4.00 (Gestión Clínica, Multiusuario y Marca Blanca)
* **v3.08 (Versión Actual Definitiva):**
  * **Personalización de Centro / Marca Blanca:** Panel de configuración para añadir Nombre de la Clínica, Especialista, Nº de Colegiado, Teléfono/Dirección y Subida de Logo personalizado (Base64).
  * **Membrete Profesional:** Incorporación automática del logo y ficha del especialista en la cabecera de los Reportes PDF.
* **v3.07:**
  * **Diseño PDF Documental:** Maquetación completa para A4 con líneas finas de precisión, márgenes de imprenta, tipografía compacta y eliminación de elementos estilo "web".
* **v3.06:**
  * **Aislamiento de Reportes PDF:** Separación estricta en CSS (`@media print`) para imprimir solo el informe clínico (1 página) sin cuadrículas ni controles de juego.
* **v3.05:**
  * **Cartel Gigante de Distancia Recomendada:** Aviso destacado en la *flashcard* inicial enunciando los cm recomendados antes de cada ejercicio.
  * **Herramienta de Calibración por Tarjeta (`💳 Calibrar`):** Ajuste de pantalla superponiendo una tarjeta física.
* **v3.04:**
  * **Resumen Flotante Accesible:** Cartel a pantalla completa con tiempo, errores y precisión foveal, descartable al tocar cualquier punto o pulsar una tecla.
* **v3.03:**
  * **Auto-Focus al Juego:** Desplazamiento automático de pantalla hacia el tablero al iniciar sesión.
  * **Indicadores Gigantes:** Tipografía de objetivo y aciertos maximizada para baja visión.
* **v3.02:**
  * **Diseñador de Pautas Terapéuticas:** Prescripción de ejercicios diarios y botón `▶️ Iniciar Siguiente Tarea` para autoconfigurar el juego.
* **v3.01:**
  * **Sistema Multiusuario Local:** Registro de pacientes y partición de historiales en `localStorage`.

### 🎨 Rama 2.xx (Analítica Foveal, e-Ink y Renderizado JS)
* **v2.04:**
  * **Modo Alto Contraste (e-Ink):** Inversión a negro azabache/blanco puro. Auto-activación en Kindle Scribe.
  * Generador de impresiones de cuadrículas en papel para trabajo analógico.
* **v2.03:**
  * **Motor de Renderizado JS:** Ajuste por código de píxeles para resolver incompatibilidades de Container Queries en motores WebKit e-Ink.
* **v2.02:** Vinculación proporcional de tamaño de letra a la celda.
* **v2.01:** Autodetección inteligente de hardware y memoria de monitor aislada por dispositivo.
* **v2.00:** Medición de tasa de precisión foveal (%), registro de fallos y selector de ojo entrenado (BIN / OD / OI).

### 🛠️ Rama 1.xx (Fundación del Motor de Juego)
* **v1.00 – v1.05:**
  * Tablero interactivo de 10x10.
  * Síntesis de voz (TTS) para instrucciones verbales.
  * Gráficas de evolución en SVG.
  * Modos de juego de Búsqueda, Coordenadas y Seguimiento.
  * Exportación e importación de datos en JSON.

---

## 🚀 Instalación y Despliegue

La aplicación está construida en **Vanilla HTML5, CSS3 y JavaScript** sin dependencias externas, lo que permite un despliegue inmediato.

### Opción A: Servidor Web / GitHub Pages
1. Clona este repositorio o descarga el archivo `index.html`.
2. Activa **GitHub Pages** en los ajustes de tu repositorio (*Settings > Pages > Branch: main*).
3. Accede desde cualquier navegador web en tu Mac, iPad, Android o Kindle.

### Opción B: Ejecución Local Offline
1. Descarga el archivo `index.html`.
2. Haz doble clic para abrirlo directamente en cualquier navegador web sin necesidad de conexión a internet.

---

## 🔒 Privacidad y Datos (GDPR / LOPD)

Esta aplicación opera **100% en el lado del cliente (*Client-Side*)**:
* Todos los datos de pacientes, historiales, pautas e imágenes de logos se almacenan exclusivamente en el navegador local (`localStorage`) del dispositivo del usuario.
* Ningún dato personal o métrico de salud se envía a servidores externos.
* Se recomienda utilizar identificadores anónimos o códigos clínicos internos al crear los perfiles de pacientes.

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** CSS Variables, Flexbox, CSS Grid y Media Queries de Impresión.
* **JavaScript (ES6+):** Motor de cálculo físico de pantalla, manipulador de DOM nativo y LocalStorage API.
* **SVG:** Renderizado vectorial de gráficas de evolución temporal.
* **Web Speech API:** Síntesis de voz nativa en español para instrucciones auditivas.