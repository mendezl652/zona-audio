# Guía de fotos para Zona Audio

Cómo tomar fotos de producto que se vean profesionales, solo con el celular
y una cartulina blanca. Escribida para vender con fichas de producto indexables
en Google.

---

## Las 3 reglas (si no lees nada más, lee esto)

1. **La foto principal va sobre fondo blanco o gris muy claro.** Es lo que el
   cliente ve en el catálogo y lo que Google indexa.
2. **Mínimo 1000 px de lado.** Por debajo de eso se ve borroso en el celular.
3. **Mínimo 3 fotos por producto.** La galería ya es clicable: al tocar una
   miniatura cambia la grande. Con 3 fotos el cliente decide sin preguntarte.

---

## ⚠️ Tu catálogo hoy

Revisé las 15 imágenes que tienes subidas. **Solo 2 están a resolución
aceptable.** Las otras 13 vienen de catálogos de proveedores y son demasiado
pequeñas.

| Producto | Fotos | Resolución máxima | Estado |
|---|---|---|---|
| Cable de instrumento 1/4" | 1 | 320x320 | ❌ peor del catálogo |
| Cable XLR profesional | 1 | 500x495 | ❌ |
| Paral para micrófono de escritorio | 1 | 461x433 | ❌ |
| Micrófonos inalámbricos Shure SN-808 | 2 | 622x507 | ❌ |
| Micrófonos de cintillo dual | 1 | 710x857 | ❌ |
| Piano Yamaha PSR-E383 | 3 | 752x461 | ❌ |
| Paral profesional para micrófono | 1 | 808x1280 | ❌ |
| Micrófonos inalámbricos Shure SN-603 | 2 | 896x1195 | ⚠️ una bien, otra no |
| **Timbales latinos 13"** | 1 | 1060x1280 | ✅ |
| **Micrófonos recargables inalámbricos** | 1 | 1168x896 | ✅ |

**Qué pasa en la práctica:** en un celular de pantalla grande, un micrófono
mostrado con 461 px se ve borroso. El cliente lo nota y se va. Además Google
penaliza las imágenes pequeñas en Google Imágenes, justo donde compiten los
precios de audio.

**Para verificar en cualquier momento** (mide los archivos de
`public/products` y compara contra lo publicado):

```
node scripts/revision-fotos.mjs
```

Marca con `!` lo que hay que mejorar.

---

## Material necesario

Nada costoso. Todo esto ya lo tienes o se consigue en una papelería:

| Material | Sirve para | Costo aprox. |
|---|---|---|
| Cartulina blanca grande (60x90) o cartón grueso | El fondo | Muy poco |
| Cinta adhesiva (scotch) | Pegar la cartulina a la pared | — |
| Mesa o superficie lisa | Apoyar el producto | — |
| Una sábana blanca lisa | Fondo alternativo | — |
| Ventana grande | La luz | Gratis |

**Sobre el flash: nunca.** El flash del celular crea una sombra dura detrás
del producto y lo aplana. La luz de una ventana es mejor y es gratis.

---

## El montaje, paso a paso

### 1. Arma el fondo

- Pega la cartulina blanca contra la pared con scotch, covering toda el área
  que abarque la foto.
- **No dejes que se vea el borde de la cartulina.** Ese borde ruinando la foto
  es el error número uno.
- Si la cartulina es muy brillante y refleja la luz, déjala apenas más mate, o
  ponle una sábana blanca encima.
- Apaga las luces de techo que den yellowish. La luz de techo es la enemiga
  del color real del producto.

### 2. Pon la luz a un lado, nunca de frente

```
        [ Ventana / luz ]
               ↓ ↓ ↓

            ✦ Producto          (a 1 metro de la ventana)

                    ▒▒▒ sombra suave hacia la derecha
```

- La ventana a la **izquierda o derecha** del producto, nunca detrás y nunca
  de frente (si la ventana está de frente, la foto sale plana y sin relieve).
- La sombra debe quedar **suave y corta**. Si queda dura y muy marcada,
  aléjalo un poco más de la pared.
- **Pégale un papel blanco a la ventana** si entra sol directo. El sol directo
  sobreexpone y quema los colores claros.

### 3. Coloca el producto

- Apóyalo a unos 10-15 cm de la pared, no pegado.
- Que ocupe entre el **70% y el 80%** del cuadro. Ni pequeño perdido, ni tan
  grande que corte el producto.
- Centrado. Activa la **cuadrícula** de la cámara (Ajustes → Cámara → Cuadrícula)
  para que no salga torcido.
- Limpia el producto antes. Un cable con huellas se nota.

### 4. Ajustes del celular

| Ajuste | Cómo |
|---|---|
| Cámara trasera | Sí, la de más resolución. Nunca la frontal |
| Zoom | **Nunca zoom digital.** Si no cabe, aléjate tú |
| Flash | **Apagado** |
| HDR | Actívalo, ayuda a que no se quemen los blancos |
| Formato | **Cambiar a JPEG** — ver nota de iPhone abajo |
| Resolución | La máxima disponible |

**Toca el producto en la pantalla** una vez para que el celular enfoque ahí, y
mantén el dedo un segundo para **bloquear el enfoque y la exposición**. Si
cambias el ángulo después, la foto no se moverá de brillo.

> **Nota importante (iPhone):** tu cámara guarda en formato HEIC por defecto y
> **el panel de Zona Audio no acepta HEIC**. Ve a *Ajustes → Cámara → Formatos*
> y ponlo en **Más compatible (JPEG)**. Si no, la imagen no sube y no vas a
> saber por qué.

### 5. Dispara

- Foto 1: **frontal**, producto centrado. Esta es la que va primero en el
  catálogo y es la que aparece en Google.
- Foto 2: **tres cuartos** (unos 30° de lado). Da volumen al producto.
- Foto 3: **detalle** (acercamiento a un conector, una pantalla, una grúa).
- Foto 4 (opcional): **foto de contexto** — el producto instalado o en uso.

---

## Qué fotografiar según el producto

### Micrófono (inalámbrico, de mano, de escritorio)

1. Frontal, de cuerpo entero, con el **transceptor o el estuche** al lado si
   viene incluido.
2. Tres cuartos.
3. **Detalle del puerto o de la base de carga.** Esto es lo que el cliente no
   entiende en la tienda y pregunta por WhatsApp.
4. Foto con **pilas o batería visibles** si aplica.

Si son dos (como el par de cintillo dual), foto con **los dos juntos
alineados**, no sueltos.

### Cable (tus dos cables)

Los cables son los productos donde más fácil es demostrar la calidad. Haz:

1. **C enrollado**, en círculo ordenado, fondo blanco. Esta da la sensación
   de "producto nuevo y ordenado".
2. **C estirado**, en diagonal, ocupando el cuadro completo.
3. **Detalle del conector** muy cerca — la rosca, los pines, la rotulación.
   Esta foto es la que justifica el precio.
4. **Detalle del cable en sí**: el forro, la malla trenzada si tiene, el
   relieve de la marca impresa.

Y como tus cables tienen **tres medidas**, una foto extra por medida si quieres
que el cliente vea que son largos distintos:

```
3 metros    → foto con algo al lado de escala (un marcador, una regla)
5 metros    → ídem
10 metros   → ídem
```

> No uses una cinta métrica si se ve "de catálogo barato". Usa una regla negra
> pequeña o simplemente pon la coiled coil al lado de tu mano.

### Paral o soporte para micrófono

1. Frontal de cuerpo entero.
2. **Detalle de la mordaza o del tornillo de ajuste.** El cliente quiere ver
   si entra su mesa de thickness gruesa.
3. **Foto con un micrófono montado.** Esta vende mucho más que el soporte
   solo — el cliente ve para qué sirve.
4. Detalle de la base (si tiene peso o si hay que llenarla con arena).

### Teclado / piano electrónico

1. **Frontal desde arriba y ligeramente de lado**, se ve todo el teclado.
2. **Panel de controles** de cerca, con los botones legibles.
3. **Detalle de las teclas** en el centro.
4. Foto con él **"encendido"** (pantalla con brillo) — aunque sea una foto con
   IA retocada para parecer encendido.

### Timbales / percusión

1. Frontal del par completo, de frente o ligeramente arriba.
2. **Detalle de la parche y aros.** Se ve el remache si es de buena calidad.
3. Foto de **ambos timbales juntos** con las fundas al lado, si las vendes
   como juego.

---

## Fondos: cuándo blanco y cuándo de contexto

| Tipo de foto | Fondo | Ajuste en tu tienda |
|---|---|---|
| Principal (catálogo y Google) | **Blanco o gris claro** | `contain` si el producto tiene fondo blanco |
| Detalles | **Blanco** | `contain` |
| Foto de contexto | Habitación, estudio, escenario | `cover` |

En tu panel, cada producto tiene un campo de **ajuste de imagen**. Los cables
ya están en `contain` porque sus fotos traen fondo blanco y con `cover` se
deformarían.

### Las fotos de contexto sí puedes generarlas con IA

Aquí la IA no engaña a nadie, porque no estás mostrando el producto, estás
mostrando **cómo se usa**. Ejemplos que funcionan:

```
"Microfono de mano inalambrico sobre una mesa de estudio pequena,
 con un estado vacio, luz calida de tarde, profundidad de campo suave,
 estilo fotografia de producto profesional"

"Cable de audio en rollo sobre fondo de madera oscura, studio minimalista"

"Teclado electronico en un cuarto con parquet, luz natural de ventana,
 angulo tres cuartos"
```

**Regla:** si la foto de IA no pretende mostrar el producto exacto, úsala. Si
pretende mostrarlo, no.

---

## Cómo subir las fotos al panel

1. Entra al panel → **Productos** → busca el producto → **Editar**.
2. En el campo **Imágenes**, presiona **Subir**.
3. Puedes seleccionar **varias fotos de una vez**.
4. La primera que subas es la que sale en el catálogo y en Google. Pon ahí la
   frontal.
5. **Guardar.**

Datos que acepta: JPG, PNG, WEBP, AVIF, GIF. Máximo **8 MB** por archivo.

No necesitas convertir a nada: sube el JPEG directo. El panel se encarga.

---

## Errores que debes evitar

| Error | Por qué daña |
|---|---|
| Foto de catálogo del proveedor | Se ve genérica, 300 px, y te compara con la competencia sin ventaja |
| Fondo con borde de cartulina visible | Ruina la foto entera |
| Flash | Sombras duras, color falso |
| Zoom digital | Foto borrosa, nunca lo hagas |
| Producto cortado en el borde | El cliente no ve qué está comprando |
| Foto borrosa o movida | Parece que no tienes el producto |
| Varias fotos con distinto fondo | Parece que la armaste rápido |
| Foto con la fecha o el logo de otro proveedor | Mala imagen para tu marca |
| Publicar sin foto | Se ve como que no tienes el producto |

---

## Comprobación rápida antes de publicar un producto

```
[ ] La foto principal tiene fondo blanco o gris claro
[ ] Se ve el producto completo, sin cortes
[ ] Mide al menos 1000 x 1000 px
[ ] Tiene 3 fotos o más
[ ] La foto está enfocada (toca la pantalla antes de disparar)
[ ] Los colores se ven reales, ni amarillentos ni azules
[ ] No hay fecha, logo ajeno ni manos de otra persona
[ ] La primera foto es la mejor de todas
```

---

## Resumen de tamaños

| Uso | Resolución mínima | Ideal |
|---|---|---|
| Tarjeta del catálogo | 1000 x 1000 | 1200 x 1200 |
| Ficha de producto (imagen grande) | 1200 x 1200 | 1600 x 1600 |
| Miniaturas de la galería | 400 x 400 | 600 x 600 |

Tu tienda genera solo los tamaños que cada pantalla necesita, así que subir
una foto grande **no la hace lenta**. Sube la mejor resolución que tengas.

---

## Orden sugerido de trabajo

1. **Empieza por los microfonos.** Son lo que más se busca en Google y lo que
   más se vende. El SN-808 y el de escritorio son los peor resueltos.
2. **Sigue con el piano.** Tiene 3 fotos pero todas de menos de 800 px.
3. **Después los cables.** Necesitas las fotos de enrollado, estirado y
   detalle del conector para justificar el precio.
4. **Al final los parals y los timbales.** Ya tienes una foto buena de los
   timbales.

---

## Documentos relacionados

- `scripts/revision-fotos.mjs` — mide la resolución de todo el catálogo
- `docs/PANEL_ADMIN.md` — cómo usar el panel
- `docs/DEPLOY_CLOUDFLARE.md` — despliegue
