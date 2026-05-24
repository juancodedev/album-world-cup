# Tareas del Proyecto

## Fase 3: Mejoras UI/UX y Funcionalidades

### Completadas
- [x] **Avatar en header**: Muestra nombre completo del usuario (o email si no tiene nombre) en vez de solo la inicial
- [x] **Eliminar "Buscar" del menú**: Se eliminó la opción de búsqueda del Sidebar y BottomNav
- [x] **Progreso por Selección**: Corregido — ahora muestra el nombre de cada selección en las barras de progreso
- [x] **Compartir colección**: Arreglado el link `/share/[code]` — ahora consulta por API y calcula stats correctamente
- [x] **Restricción Admin**: Solo `cl.jmunoz@gmail.com` puede acceder al panel de administración
- [x] **Editar láminas en Admin**: Se agregó botón de edición (✏️) y PATCH endpoint para modificar imágenes y datos de jugadores
- [x] **Debounce en Tracker**: Las selecciones de láminas se acumulan y guardan después de 5s sin actividad
- [x] **Placeholder en láminas**: StickerCard muestra un placeholder SVG cuando la imagen falla al cargar
- [x] **Imágenes en Colección/Tracker**: StickerCard muestra la imagen real o un placeholder con check verde si está obtenida
- [x] **Miniaturas en StickerGrid**: Las celdas de la cuadrícula del tracker ahora muestran la miniatura real de la lámina usando `imageThumbnail` o `imageUrl`

### Pendientes
- [x] **Sincronizar usuarios de auth.users a public.users**: Migración 008 ejecutada en Supabase SQL Editor
