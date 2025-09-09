### **Diseño UX de Ponti (Fase 2): Flujo de Autenticación y Onboarding**

Este documento describe el macroflujo de la primera interacción del usuario con Ponti, asegurando que el proceso de inicio de sesión y la bienvenida inicial sean fluidos, claros y coherentes con nuestros principios de diseño.

### **Objetivo del Flujo**

1. **Autenticación sin fricción:** Permitir que el usuario acceda a su cuenta de forma rápida y segura.  
2. **Onboarding de Valor:** Para los nuevos usuarios, presentar el valor principal de la aplicación en menos de 30 segundos, sin un tutorial exhaustivo.  
3. **Establecer Confianza:** Proporcionar retroalimentación clara en cada paso (carga, errores, éxito).

### **Subflujo 1: Primera Sesión de un Usuario**

Este es el flujo para un estudiante que nunca ha iniciado sesión en la aplicación.  
**Paso 1: Pantalla de Carga Inicial (Splash Screen)**

* **Acción del Usuario:** Abre la aplicación Ponti.  
* **Respuesta del Sistema:**  
  * Se muestra una pantalla simple y limpia con el logo de "Ponti" en el centro.  
  * Duración: 1-2 segundos, mientras la aplicación carga los recursos iniciales.  
  * Transición: La pantalla de carga se desvanece suavemente para dar paso a la Pantalla de Inicio de Sesión.

**Paso 2: Pantalla de Inicio de Sesión**

* **Acción del Usuario:** Ve la pantalla de login. Introduce su ID de estudiante y contraseña.  
* **Respuesta del Sistema:**  
  * La interfaz es exactamente como se describió en la Fase 1\.  
  * Los campos de texto tienen placeholders claros ("ID de Estudiante", "Contraseña").  
  * El botón "Iniciar Sesión" está deshabilitado hasta que ambos campos contengan texto, para evitar envíos accidentales.

**Paso 3: Proceso de Autenticación**

* **Acción del Usuario:** Toca el botón "Iniciar Sesión".  
* **Respuesta del Sistema (Estados):**  
  * **Estado de Carga:**  
    * El botón "Iniciar Sesión" cambia su texto a "Iniciando..." y muestra un ícono de carga (spinner) a su lado.  
    * Los campos de ID y contraseña se deshabilitan para prevenir ediciones durante la validación.  
    * Este estado le comunica al usuario que el sistema está trabajando.  
  * **Estado de Error:**  
    * Si las credenciales son incorrectas, el sistema muestra un mensaje de error conciso y amigable justo debajo de los campos de texto (ej. "ID o contraseña incorrectos. Por favor, verifica tus datos.").  
    * Los bordes de los campos de entrada cambian a un color rojo sutil para indicar dónde está el problema.  
    * El botón "Iniciar Sesión" vuelve a su estado original, permitiendo un nuevo intento.  
  * **Estado de Éxito:**  
    * Las credenciales son validadas correctamente.  
    * El sistema navega al siguiente paso: el Onboarding.

**Paso 4: Onboarding Rápido (Solo la primera vez)**

* **Propósito:** No es un tutorial, es una bienvenida que resalta los 3 beneficios clave.  
* **Diseño:** Se presenta una secuencia de 3 "diapositivas" (slides) en una ventana modal superpuesta. El usuario puede deslizar entre ellas.  
  * **Slide 1: Bienvenida Personalizada**  
    * **Título:** ¡Hola, \[Nombre del Estudiante\]\!  
    * **Texto:** Bienvenido a Ponti. Aquí, toda tu vida universitaria está organizada en un solo lugar.  
  * **Slide 2: El Poder del "Hoy"**  
    * **Visual:** Una imagen simplificada del Dashboard, destacando la tarjeta "Próxima Clase".  
    * **Texto:** Tu día, simplificado. En la pestaña "Hoy" siempre verás lo más importante y urgente.  
  * **Slide 3: Navegación Intuitiva**  
    * **Visual:** Una imagen que señala la barra de navegación inferior.  
    * **Texto:** Accede a tu horario completo, el mapa del campus y más, siempre a un toque de distancia.  
* **Acción del Usuario:** En la última diapositiva, toca un botón grande con el texto "¡Entendido\!".  
* **Respuesta del Sistema:** La ventana modal de onboarding se cierra con una animación suave.

**Paso 5: Aterrizaje en el Dashboard**

* **Acción del Usuario:** Ninguna.  
* **Respuesta del Sistema:** Inmediatamente después de cerrar el onboarding, el usuario ve la pantalla "Hoy" (Dashboard) completamente cargada con su información real (próxima clase, anuncios, etc.). El flujo ha terminado.

### **Subflujo 2: Usuario Recurrente**

Este flujo es para un usuario que ya ha iniciado sesión previamente.  
**Paso 1: Apertura de la App y Sesión Persistente**

* **Acción del Usuario:** Abre la aplicación Ponti.  
* **Respuesta del Sistema:**  
  * La aplicación primero verifica si existe una sesión activa y válida.  
  * **Si la sesión es válida:** El usuario no verá la pantalla de login. El sistema lo llevará directamente desde la Pantalla de Carga (Splash Screen) a su Dashboard ("Hoy"). Este es el comportamiento ideal y más común.  
  * **Si la sesión ha expirado o no existe:** El sistema lo dirige a la Pantalla de Inicio de Sesión.

**Paso 2: Inicio de Sesión (si es necesario)**

* **Acción del Usuario:** Introduce sus credenciales.  
* **Respuesta del Sistema:** Sigue el mismo "Paso 3: Proceso de Autenticación" del flujo de primera sesión (con sus estados de carga, error y éxito). Sin embargo, en el estado de éxito, **no se muestra el onboarding**. Se le redirige directamente al Dashboard.

### **Diagrama de Flujo (Texto)**

(Usuario Abre App) \-\> \[Splash Screen\] \-\> ¿Sesión Activa?  
    |  
    |-- (Sí) \--\> \[Pantalla "Hoy" (Dashboard)\] \-\> (Fin)  
    |  
    |-- (No) \--\> \[Pantalla de Login\] \-\> (Usuario ingresa datos) \-\> \[Validación\]  
                     |  
                     |-- (Error) \--\> \[Muestra Mensaje de Error\] \-\> Vuelve a \[Pantalla de Login\]  
                     |  
                     |-- (Éxito) \--\> ¿Es Primera Vez?  
                                     |  
                                     |-- (Sí) \--\> \[Onboarding (3 slides)\] \-\> \[Pantalla "Hoy" (Dashboard)\] \-\> (Fin)  
                                     |  
                                     |-- (No) \--\> \[Pantalla "Hoy" (Dashboard)\] \-\> (Fin)  
