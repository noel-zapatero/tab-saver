# TabSaver

Extensión para Chrome para guardar y restaurar sesiones de pestañas.

El objetivo era simplemente poder guardar y restaurar un conjunto de pestañas que tal vez se requiera de forma regular. Se puede hacer algo similar con los grupos de pestañas de Chrome, pero no siempre me funciono de forma correcta.

## Instalación

1. Clonar o descargar el repo
2. Ir a `chrome://extensions`
3. Activar "Modo Desarrollador" (arriba a la derecha)
4. Hacer click en "cargar descomprimida" y seleccionar esta carpeta

Por el momento, la extension no se encuentra en el Chrome Web Store debido a que para ser cargada, es requerido pagar una tarifa. 

## Uso

- Escribir el nombre con el que vas a guardar la sesion y presionar guardar (o enter)
- El botón ↗ en una sesión la abre en una ventana nueva
- El botón × elimina la sesión
- Exportar/Importar sirve para hacer backup o mover sesiones entre navegadores

Las sesiones se guardan en el localStorage de la extensión, persisten entre reinicios del navegador.