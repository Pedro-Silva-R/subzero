Está muy bien esta pantalla principal. Ahora debemos pasar a la Vista de Agregar/Editar suscripción:

1. Contexto y objetivo
Crea la vista de Agregar/Editar suscripción de la PWA de gestión de suscripciones personales. La misma vista debe servir para:


Alta: crear una nueva suscripción.

Edición: modificar una suscripción existente.
Mantén el estilo neobrutalista utilitario de la Home: fondos claros, bordes negros gruesos, inputs robustos, sin gradientes genéricos ni tarjetas “AI UI”.
2. Estilo global (heredado de la app)
Tipografía


UI / labels / títulos: Space Grotesk.

Montos y datos numéricos: Fira Code (monoespaciada).
Paleta
Usa la misma paleta de la pantalla principal:


Fondo base: #F4F1EC.

Texto principal: #18181B.

Acento principal / botones primarios: #FF5A1F.

Estado/alertas (si aparecen): rojo ladrillo #D7263D, verde mate #1E8E4D.
Tratamiento visual


Inputs y bloques con borde negro de 2–3 px.

Nada de sombras suaves difusas; si hay sombra, que sea dura y mínima.

Evita gradientes azul‑morado y tarjetas genéricas de UI kit.
3. Estructura semántica y layout
Estructura base
Dentro de <main>:


<header> de la vista.

<form> con grupos de campos.

Zona de acciones al final (botones).
Títulos


Alta: H1/H2 → “Agregar suscripción”.

Edición: H1/H2 → “Editar suscripción”.
En ambos casos, un pequeño texto descriptivo debajo (párrafo corto) tipo: “Usamos estos datos para calcular tu gasto mensual y anual.”
Layout mobile‑first


Contenido apilado verticalmente.

Padding lateral 16–20 px.

Espaciado vertical generoso entre grupos (gap claro).

Tipografía con tamaños fluidos vía clamp().
En desktop, el formulario sigue siendo de una sola columna (no lo conviertas en 2 columnas aún); prioriza legibilidad.
4. Grupos de campos del formulario
Usa <fieldset> y <legend> cuando tenga sentido, o al menos agrupa visualmente con bloques con borde.
Grupo A – Identidad de la suscripción


Nombre de la suscripción (obligatorio)


<label> + <input type="text">.

Placeholder: “Netflix”, “Gimnasio”, “Dominio web…”.

Categoría


<label> + <select> con opciones:


Streaming, Software, Juegos, Membresía, Servicios, Otros.

Con quién la compartes


<label> + grupo de checkboxes: Yo, Pareja, Familia, Otros.
Estilo


Cada campo en su propio bloque: label encima en Space Grotesk, input con fondo blanco y borde negro 2 px.
Grupo B – Montos y ciclo


Monto (obligatorio)


<label> + <input type="number" step="0.01">.

El valor en Fira Code (clase específica para la tipografía).

Moneda


<label> + <select> (por ahora CLP / USD / etc.).

Ciclo


<label> + <select> o radio buttons:


Mensual, Anual, Otro (por ahora puedes dejar “Otro” sin lógica especial visual).
Debajo, un texto auxiliar en Fira Code (solo lectura) con el equivalente:


Ejemplo: “Equivalente mensual: $X” o “Equivalente anual: $Y”, calculado a partir del ciclo y el monto (no hace falta mostrar la lógica, solo deja un espacio para ese texto).
Grupo C – Fechas y trial


Fecha del próximo cobro (obligatorio)


<label> + <input type="date">.

Es periodo de prueba (trial)


Checkbox: <input type="checkbox"> + label “Es un periodo de prueba”.
Cuando el checkbox está activo:


Mostrar campos adicionales:


Fecha de fin de trial: <input type="date">.

Texto auxiliar pequeño (párrafo):


“Te avisaremos antes de que empiece a cobrar.”
(La lógica de pasar trial → activa se maneja en backend; solo prepara la UI.)
Grupo D – Método de pago


Método de pago


<label> + <select> con métodos existentes (ej. “Visa ***1234”, “Cuenta vista”) y una opción “Otro…”.

Si el usuario elige “Otro…”, muestra un <input type="text"> para escribir el nombre manualmente.

Notas de pago (opcional)


<label> + <input type="text"> o <textarea> corto.

Placeholder: “Promoción 12 meses”, “Tarifa estudiante”, etc.
Grupo E – Estado y notas


Estado de la suscripción


<label> + <select>:


Activa, Pausada, Cancelada (solo en contexto de edición), opcionalmente “Zombie” si quieres exponerlo aquí.

Notas


<label> + <textarea> de 2–3 filas para comentarios libres.
En modo Alta, el estado por defecto es Activa (o Trial si el checkbox está marcado). En modo Edición, el <select> muestra el estado actual.
5. Zona de acciones (botones)
Ubicada al final del <form>.
Alta


Botón principal:


<button type="submit">

Texto: “Guardar suscripción”.

Botón secundario:


<button type="button">Cancelar</button> (o link) que vuelve a la Home.
Edición


Botón principal:


<button type="submit">Guardar cambios</button>.

Botón secundario:


<button type="button">Descartar</button>.

Botón de peligro (opcional, separado visualmente):


<button type="button">Marcar como cancelada</button> o “Eliminar suscripción”.
Estilo de botones


Botón principal:


Fondo #FF5A1F, texto negro, borde negro 2–3 px, forma rectangular (pocas curvas).

Botones secundarios:


Fondo blanco, borde negro 2 px, texto negro.
Añade transiciones cortas (transition: transform 0.15s, background-color 0.15s;) y un pequeño efecto de “push” (transform: translateY(1px) en :active) para dar vida.
6. Accesibilidad y validaciones


Labels siempre visibles, asociados a inputs con for / id.

Campos obligatorios: nombre, monto, moneda, ciclo, fecha de próximo cobro; y fecha de fin de trial si “Es trial” está activo.

Mensajes de error claros y sobrios junto al campo:


Ej. “Este campo es obligatorio”, “El monto debe ser mayor que cero”.

Orden natural de tabulación (Tab recorre los campos en orden visual); estado :focus muy visible (outline/borde negro más fuerte).