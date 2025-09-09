### **Diseño UX de Ponti (Fase 3): Flujos y Casos de Uso del Dashboard ('Hoy')**

Este documento detalla el diseño funcional, los microflujos de interacción y los distintos estados de la pantalla "Hoy", el núcleo de la experiencia de Ponti.

### **Objetivo de la Pantalla "Hoy"**

Proporcionar una vista consolidada y priorizada de la información más relevante para el estudiante *en el momento presente*, eliminando la necesidad de buscar en múltiples fuentes y respondiendo a la pregunta: "¿En qué debo concentrarme ahora?".

### **1\. Componentes Principales y su Lógica**

La pantalla se estructura en base a tarjetas modulares.

#### **a. Saludo y Fecha**

* **Diseño:** Ubicado en la parte superior. Un texto grande y amigable.  
* **Contenido:**  
  * Línea 1: "Hola, \[Nombre del Estudiante\]"  
  * Línea 2: La fecha actual en un formato claro, ej: "Lunes, 8 de septiembre".  
* **Lógica:** El nombre se obtiene del perfil del usuario. La fecha se actualiza dinámicamente.

#### **b. Tarjeta Principal: Contextual y Dinámica**

Esta es la tarjeta más importante y su contenido cambiará según la hora del día y el horario del estudiante.

* **Caso 1 (Default): "Próxima Clase"**  
  * **Cuándo se muestra:** Desde el inicio del día hasta que la última clase del día haya terminado.  
  * **Contenido:**  
    * Título grande: Nombre de la materia (ej. "Cálculo Diferencial").  
    * Información clave: \[Hora de Inicio\] \- \[Hora de Fin\] (ej. "10:00 AM \- 12:00 PM").  
    * Detalles secundarios: Nombre del Profesor, Salón (ej. "Bloque 5 \- 201").  
    * **Indicador de Proximidad (muy importante):** Un pequeño tag o "píldora" de color que cambia dinámicamente:  
      * Próxima: (Color neutro/azul) \- Si falta más de una hora.  
      * En 30 min: (Color de advertencia/amarillo) \- Si falta menos de una hora.  
      * En curso: (Color activo/verde) \- Si la clase está ocurriendo ahora mismo.  
  * **Microflujo de Interacción:**  
    * Tocar la tarjeta navega directamente a la vista de "Horario", con el día actual seleccionado y la vista centrada en esa clase específica. Esto permite al usuario ver qué tiene antes o después con un solo toque.  
* **Caso 2: "Has terminado por hoy"**  
  * **Cuándo se muestra:** Después de que la última clase del día ha finalizado.  
  * **Contenido:**  
    * Un mensaje motivacional y de cierre.  
    * Título: "¡Buen trabajo\!" o "¡Eso es todo por hoy\!".  
    * Texto: "Has completado todas tus clases programadas. ¡Disfruta el resto del día\!".  
    * Visual: Podría incluir un ícono simple y amigable (como un checkmark o una cara sonriente).  
* **Caso 3: "Día Libre"**  
  * **Cuándo se muestra:** En días sin clases programadas (fines de semana, festivos, vacaciones).  
  * **Contenido:**  
    * Un mensaje que informa y relaja.  
    * Título: "Hoy no tienes clases".  
    * Texto: "Aprovecha para descansar, estudiar o participar en algún evento del campus.".  
    * (Opcional) Podría mostrar un acceso directo a la sección de "Noticias y Eventos".

#### **c. Sección Secundaria: "Anuncios Importantes"**

* **Diseño:** Una sección debajo de la tarjeta principal con un título claro.  
* **Contenido:**  
  * Se mostrarán las 2 o 3 noticias o anuncios más recientes publicados por la universidad.  
  * Cada anuncio será una pequeña tarjeta con su Título y una o dos líneas de resumen.  
* **Lógica:** Los anuncios se obtienen de la base de datos y se ordenan por fecha de publicación descendente.  
* **Microflujo de Interacción:**  
  * Tocar cualquier tarjeta de anuncio abrirá una nueva pantalla (o una vista modal) con el contenido completo del anuncio (título, fecha, cuerpo del texto).  
* **Caso Borde: Sin Anuncios**  
  * Si no hay anuncios recientes, la sección no se muestra en absoluto. El espacio se colapsa para mantener la interfaz limpia y no mostrar un estado de "No hay nada que ver aquí".

### **2\. Estados de la Pantalla Completa**

#### **a. Estado de Carga (Loading)**

* **Cuándo se muestra:** La primera vez que se accede al Dashboard en una sesión, mientras se obtienen los datos (horario, anuncios).  
* **Diseño:** Se mostrará una versión "esqueleto" (skeleton screen) de la interfaz. Es decir, cajas grises animadas que simulan la forma de las tarjetas y el texto. Esto le da al usuario una percepción de carga mucho más rápida y moderna que un simple spinner en el centro.

#### **b. Estado de Error**

* **Cuándo se muestra:** Si la aplicación no puede conectar con el servidor para obtener los datos.  
* **Diseño:**  
  * Se muestra un mensaje de error claro y centrado.  
  * Título: "No se pudo cargar tu información".  
  * Texto: "Parece que hay un problema de conexión. Por favor, inténtalo de nuevo.".  
  * **Acción:** Un botón prominente de "Reintentar" que permite al usuario volver a ejecutar la llamada para obtener los datos sin tener que cerrar la app.

### **Resumen del Flujo Lógico del Dashboard**

1. Usuario navega a la pestaña "Hoy".  
2. Se muestra el **Estado de Carga** (skeleton).  
3. La app solicita los datos del horario del día y los anuncios.  
4. Si hay un error de red \-\> Muestra el **Estado de Error** con el botón "Reintentar".  
5. Si los datos llegan correctamente:  
   * La app evalúa el horario del día actual.  
   * Muestra la **Tarjeta Principal** correspondiente: "Próxima Clase", "Has terminado por hoy" o "Día Libre".  
   * Si hay anuncios, muestra la sección de **Anuncios**. Si no, la oculta.  
   * La pantalla está lista para la interacción del usuario.