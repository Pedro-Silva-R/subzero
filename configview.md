Vista de Configuración

1. Objetivo de la vista
   Crear una pantalla de Configuración donde el usuario pueda:

Ajustar preferencias generales de la app (moneda, idioma, tema).

Configurar notificaciones de recordatorio.

Gestionar datos (backup/export, borrado local).

Estructura tipo lista agrupada (secciones con títulos + ítems), no un dashboard complejo.

2. Estructura semántica y layout
   Dentro de <main>:

<header> con título “Configuración”.

Sección “Preferencias generales”.

Sección “Notificaciones”.

Sección “Pagos y datos”.

Sección “Acerca de la app”.

Layout tipo lista de settings: grupos con títulos y debajo filas de ajustes (<ul> + <li>).

Jerarquía de headings

H1/H2: “Configuración”.

H2/H3 por sección: “Preferencias generales”, “Notificaciones”, “Pagos y datos”, “Acerca de la app”.

3. Header
<header> con:

Botón/Link “Atrás” (hacia Home).

Título: “Configuración”.

Opcional: subtítulo corto (“Ajusta cómo se comporta la app”).

Separador (borde inferior) entre header y lista de secciones.

4. Sección “Preferencias generales”
   Semántica

<section aria-labelledby="prefs-generales-heading">.

H2/H3: “Preferencias generales”.

Dentro, <ul> con <li> por ajuste.

Ajustes propuestos

Moneda por defecto

Fila con label “Moneda por defecto”.

Valor actual a la derecha (por ejemplo “CLP”).

Al tocar, abre modal o sub‑vista para elegir entre CLP, USD, etc.

Idioma (si lo vas a soportar)

Fila con label “Idioma”.

Valor actual (“Español”).

Acción igual que Moneda (modal o sub‑vista).

Tema (futuro, opcional)

Fila con label “Tema”.

Valor: “Claro” / “Oscuro” / “Del sistema” si lo implementas más adelante.

Cada <li> se ve como una fila de settings clásica: título a la izquierda, valor actual a la derecha, y opcionalmente un icono de flecha para indicar que se puede tocar.

5. Sección “Notificaciones”
   Semántica

<section aria-labelledby="notificaciones-heading">.

H2/H3: “Notificaciones”.

<ul> con <li>.

Ajustes

Recordatorios de cobro

Fila con:

Label: “Recordatorios de cobro”.

Switch/toggle a la derecha (on/off).

Si está apagado → no se envían notificaciones.

Anticipación del recordatorio

Solo mostrar si el toggle anterior está ON.

Fila con:

Label: “Recordar antes de cobrar”.

Valor actual a la derecha: “3 días antes”, “5 días antes”, etc.

Al tocar, abre modal / selector simple de días (ej: 1, 3, 5, 7).

Recordatorios de fin de trial

Fila con checkbox o toggle: “Avisar antes de que termine un periodo de prueba”.

6. Sección “Pagos y datos”
   Semántica

<section aria-labelledby="pagos-datos-heading">.

H2/H3: “Pagos y datos”.

<ul> de <li>.

Exportar datos

Fila con label: “Exportar datos de suscripciones”.

Texto secundario: “Descargar un archivo con tus suscripciones” (aunque la funcionalidad llegue después, reserva el espacio).

Borrar datos locales

Fila de acción peligrosa: “Borrar todos los datos de esta app en este dispositivo”.

Se recomienda diferenciar visualmente (texto en color más “alerta”, por ejemplo), y que al pulsar requiera confirmación (modal / diálogo).

7. Sección “Acerca de la app”
   Semántica

<section aria-labelledby="acerca-heading">.

H2/H3: “Acerca de la app”.

<ul> de <li> o simple bloque con texto.

Contenido sugerido

Fila “Versión”: muestra número de versión actual (ej. “Versión 1.0.0”).

Fila “Créditos” o “Sobre este proyecto”: puede abrir un texto o modal con una breve descripción.

Fila “Política de privacidad” (si la agregas más adelante) → link a documento/URL.

8. Interacciones y accesibilidad
   Cada fila de configuración (cada <li>) debe ser claramente clicable (aumentar área táctil) y tener foco visible en teclado.

Para filas que abren otra vista/modal, indica que son navegables (flecha, icono o texto “>” a la derecha, con aria-label apropiado si usas solo icono).

Tab debe recorrer de forma lógica: header → secciones en orden → filas dentro de cada sección → acciones peligrosas (como borrar datos) al final.

Acciones destructivas (borrar datos locales) deben pedir confirmación; desde Stitch basta con reservar espacio para el modal/diálogo básico (título, texto, botones “Cancelar” y “Confirmar”).
