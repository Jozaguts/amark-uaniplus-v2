# Editor de diseño (`/design`) — fuentes de imagen por pestaña y cambio de color

> Referencia rápida para no volver a confundir de dónde toma las imágenes cada
> pestaña del editor (`app/pages/design/[id].vue`) y cuál es la decisión vigente
> sobre el cambio de color. Última actualización: 2026-06-09.

## Qué imagen usa cada pestaña

Cada pestaña toma sus imágenes de una **fuente distinta** del payload del editor
(`GET /api/products/{type}/{identifier}` → `data.editor`):

| Pestaña | Fuente de imagen | Notas |
|---|---|---|
| **Design** (canvas editable) | **`editor.views[].mockup`** | Template de la vista activa. **1 imagen por vista** (front/back/sleeve…), **sin variante por color**. |
| **Mockups** | **`editor.mockups[]`** | Foto por **vista × color**. Fallback a `editor.views[].mockup` si no hay foto para esa vista/color. |

### Cadena en el código (`app/pages/design/[id].vue`)

**Design:**
- `canvasImage` se carga vía `watch(activeMockup, … image.src = mockup.src)` (~`:2217`).
- `activeMockup = computed(() => activeView.value?.mockup ?? null)` (~`:312`).
- ⇒ la imagen base del canvas es `editor.views[activeView].mockup.src`. **No depende del color seleccionado.**

**Mockups:**
- `allEditorMockups = computed(() => editor.value?.mockups ?? [])` (~`:315`).
- `<DesignMockupGallery :mockups="allEditorMockups" … />`.
- En `MockupGallery`: `selectMockupForView(mockups, view, selectedColorId)` elige por `viewId` + `previewColorId`; `activeMockupSrc = activeMockup?.src ?? activeView.value?.mockup.src`.

## Decisión sobre el cambio de color (vigente, jun 2026)

El cambio de color **visual** ocurre **solo en la pestaña Mockups**.

- **Mockups:** cambiar de color = **swap de imagen completa** (`editor.mockups[]` filtrado por `previewColorId`). El color es perfecto porque viene horneado en la foto. Ya funciona.
- **Design:** los botones/opciones de color **solo INDICAN** el color elegido; la prenda **no cambia visualmente**. Se retiró el tint backdrop (rect de Konva detrás del PNG) porque las **líneas guía (dashed) del PNG** se perdían en colores oscuros.

### Por qué

- En Design se tintaba un PNG con líneas guía → en colores oscuros se perdían.
- En Mockups no se tinta: se intercambia la imagen, así el color sale perfecto.

### Requerimiento futuro (hoy NO)

Si más adelante se pide cambio de color en la pestaña **Design**, **no será igual
que en Mockups**:
- Mockups = swap de imagen (foto por color).
- Design = **tint CSS** sobre el template (no swap), o apuntar el canvas a otra
  fuente por color usando el `printZone` de esa foto. Es requerimiento futuro, no
  actual.

## Relacionado

- `editor.mockups[]` (contrato): cada mockup `flat` lleva `viewId`,
  `previewColorId` (= `editor.colors[].id`), `src`, `width`, `height`,
  `printZone {x,y,w,h,rotation}` (ratios 0–1) y `blendMode`. El `printZone`
  posiciona el diseño sobre la foto.
- La **máscara** (`maskUrl`) hoy solo sirve para color/tint; el **recorte** del
  diseño a la silueta de la prenda aún **no está programado** en el front.
- ⚠️ Gotcha: `selectMockupForView` elige cualquier mockup `kind: 'lifestyle'`
  **primero, ignorando el color**. Los mockups por color deben ser `kind: 'flat'`.
