### **Diseño UX de Ponti (Fase 1): Arquitectura Visual y Principios de Diseño**

Este documento establece los cimientos de la experiencia de usuario para el MVP de Ponti. El objetivo es definir una estructura coherente, moderna e intuitiva que resuelva la frustración del usuario con interfaces obsoletas y poco funcionales.

### **1\. Filosofía y Principios de Diseño**

Para combatir la complejidad y las interfaces anticuadas, nos guiaremos por los siguientes principios:

* **Claridad sobre Abundancia:** Cada pantalla tendrá un propósito principal y único. Evitaremos sobrecargar al usuario con información irrelevante. Si no es esencial para la tarea en cuestión, no estará en la pantalla.  
* **Menos es Más (Enfoque Minimalista):** Utilizaremos espacios en blanco generosos, una tipografía clara y una paleta de colores limitada para crear una sensación de calma y control. La interfaz debe "respirar".  
* **Consistencia Visual y Funcional:** Los elementos interactivos (botones, enlaces, tarjetas) se verán y comportarán de la misma manera en toda la aplicación. Esto reduce la carga cognitiva y hace que la navegación sea predecible.  
* **Diseño Orientado al Contenido:** La interfaz debe realzar el contenido del usuario (su horario, sus clases, las noticias), no competir con él. El diseño es el escenario, no el protagonista.

### **2\. Estructura de Navegación Principal**

La navegación se basará en una **Barra de Pestañas (Tab Bar)** fija en la parte inferior de la pantalla. Este es un patrón de diseño móvil universalmente reconocido, que proporciona acceso instantáneo a las secciones clave de la aplicación.  
La Tab Bar del MVP contendrá **cuatro iconos**:

1. **Hoy (Dashboard):** El epicentro de la aplicación. Muestra la información más relevante para el día actual. Será la pantalla de inicio después de la autenticación.  
2. **Horario:** Acceso a la vista semanal completa del horario académico del estudiante.  
3. **Mapa:** El mapa interactivo del campus.  
4. **Más:** Un espacio para agrupar funcionalidades secundarias como el Directorio de Servicios, el Perfil del usuario y la opción de Cerrar Sesión.

Esta estructura es escalable. En el futuro, se podrían añadir más pestañas o reorganizar las existentes según el feedback de los usuarios.

### **3\. Descripción de las Pantallas Clave del MVP**

#### **a. Pantalla de Inicio de Sesión (Login)**

* **Propósito:** Autenticar al usuario de forma rápida y segura.  
* **Diseño y Componentes:**  
  * **Visual:** Centrada, limpia y sin distracciones. El logo de "Ponti" destacará en la parte superior.  
  * **Campos de Entrada:**  
    * Un campo para el "ID de Estudiante" (con un ejemplo, ej: "000123456").  
    * Un campo para la "Contraseña".  
  * **Botón Principal (CTA):** Un botón grande y prominente con el texto "Iniciar Sesión".  
  * **Acciones Secundarias:**  
    * Un enlace de "¿Olvidaste tu contraseña?".  
    * (Opcional pero recomendado) Un botón de "Iniciar Sesión con Google" para ofrecer una alternativa más rápida.

#### **b. Pantalla "Hoy" (Dashboard)**

* **Propósito:** Ofrecer al usuario un resumen visual e inmediato de su día, respondiendo a la pregunta: "¿Qué es lo más importante para mí en este momento?".  
* **Diseño y Componentes:**  
  * **Estructura:** Basada en tarjetas (cards) modulares y fáciles de escanear.  
  * **Saludo:** Un saludo simple en la parte superior: "Hola, \[Nombre del Estudiante\]".  
  * **Tarjeta "Próxima Clase":**  
    * Será la tarjeta más prominente.  
    * Mostrará: Nombre de la materia, hora de inicio y fin, nombre del profesor y número del salón/aula.  
    * Un indicador visual (ej. "En 15 minutos") si la clase está por comenzar.  
  * **Tarjeta "Anuncios Recientes":**  
    * Un carrusel o una lista vertical con los 2-3 anuncios más recientes de la universidad o la facultad.  
    * Cada anuncio mostrará un título y un resumen corto. Tocar la tarjeta llevará al detalle del anuncio.  
  * **Accesos Rápidos (Opcional):** Debajo de las tarjetas, podríamos incluir 2 o 3 botones grandes para las acciones más comunes, como "Ver Horario Completo" o "Buscar en el Mapa".

#### **c. Pantalla "Horario"**

* **Propósito:** Permitir al usuario visualizar su horario académico completo de la semana.  
* **Diseño y Componentes:**  
  * **Selector de Día:** Una fila de pestañas o botones en la parte superior para seleccionar el día de la semana (L, M, X, J, V, S). El día actual estará seleccionado por defecto.  
  * **Vista de Cronograma:** Una vista vertical que simula una agenda. Las clases se mostrarán como bloques de tiempo.  
  * **Tarjeta de Clase:** Cada bloque contendrá la misma información que en el dashboard (Materia, Profesor, Salón, Hora).  
  * **Interacción:** Tocar una tarjeta de clase podría abrir una vista de detalle con más información (si la hubiera en el futuro, como notas o archivos adjuntos).

#### **d. Pantalla "Mapa"**

* **Propósito:** Ayudar al usuario a orientarse y encontrar ubicaciones clave dentro del campus.  
* **Diseño y Componentes:**  
  * **Barra de Búsqueda:** Una barra de búsqueda prominente en la parte superior con un texto de ejemplo como "Buscar salones, cafeterías, oficinas...".  
  * **Vista del Mapa:** La imagen del mapa del campus ocupará la mayor parte de la pantalla.  
  * **Pines/Marcadores:** Marcadores visuales para los puntos de interés más importantes.  
  * **Interacción:**  
    * Al buscar, el mapa se centrará en el marcador correspondiente y/o mostrará una lista de resultados.  
    * Tocar un pin en el mapa abrirá una pequeña tarjeta informativa en la parte inferior con el nombre del lugar y quizás una breve descripción o el horario.

#### **e. Pantalla "Más"**

* **Propósito:** Agrupar funcionalidades que no requieren acceso inmediato desde la barra de navegación principal.  
* **Diseño y Componentes:**  
  * **Estructura:** Una lista de opciones de navegación vertical, simple y clara.  
  * **Elementos de la Lista:**  
    * **Perfil:** (Mostraría el nombre y ID del estudiante).  
    * **Directorio de Servicios:** Lleva a una nueva pantalla con la lista de servicios.  
    * **Notificaciones:** (Para gestionar las preferencias de notificación en el futuro).  
    * **Ayuda y Soporte.**  
    * **Cerrar Sesión:** Con un ícono distintivo y ubicado al final de la lista.