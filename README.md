# Smart Parking Frontend

Aplicación web frontend para el sistema de gestión y control de acceso a los estacionamientos de los campus Miguelete y Tornavías de la Universidad Nacional de San Martín (UNSAM).

## Tecnologías

- React 19 para la interfaz de usuario.
- JavaScript con módulos ES.
- Vite 8 para desarrollo local y generación del build.
- ESLint 10 para análisis estático y consistencia del código.

## Requisitos

- Node.js 22.12 o superior (se recomienda Node.js 24).
- npm.

## Instalación y uso

Cloná el repositorio y, desde su directorio, instalá las dependencias:

```bash
npm install
```

Iniciá el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación. Para generar y revisar una versión de producción:

```bash
npm run build
npm run preview
```

Para ejecutar el análisis de código:

```bash
npm run lint
```

## Estructura principal

```text
src/
    assets/    Recursos estáticos importados desde la aplicación
    App.jsx    Componente principal
    App.css    Estilos del componente principal
    index.css  Estilos globales
    main.jsx   Punto de entrada de React
public/      Archivos estáticos servidos directamente
```

## Desarrollo

La aplicación se monta desde `src/main.jsx` y utiliza `src/App.jsx` como componente raíz. Los cambios realizados en modo desarrollo se reflejan en el navegador mediante Vite.

## Autoría

- Matias Paciotti Iacchelli
- Fausto Ramirez Alvarez
- Valentin Tiraboschi 
-


