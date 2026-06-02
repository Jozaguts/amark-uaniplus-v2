# Mockup Lifestyle — Subproyecto A (frontend + contrato)

**Fecha:** 2026-06-02
**Estado:** Diseño aprobado, listo para plan de implementación
**Repo:** uandiplus (Nuxt 4 storefront)

## Resumen

Reemplazar la plantilla plana de Printful en la pestaña **Mockups** del editor por **fotos de modelo reales** (lifestyle), con el diseño del cliente compuesto encima y la prenda **teñida por CSS** al color que el cliente ya eligió. Esto es el **Subproyecto A**: el render en el frontend + el contrato de datos que el backend (Subproyecto B) llenará después.

La pestaña Mockups es de **solo lectura**: el color y las imágenes del diseño se eligen en la pestaña **Design**; Mockups solo muestra el resultado final. No hay selector de color en la galería.

A coexiste con el comportamiento actual: productos sin mockups lifestyle siguen usando la plantilla plana sin cambios.

## Contexto y validación previa

La nota técnica `references/Sagit-Mockup-Solution-Note.html` validó el enfoque: la vista previa se renderiza **client-side** (instantánea, sin API), separada de la producción (Printful, en cola, después del pago). A implementa esa vista previa con fotos de modelo en lugar de la plantilla plana.

Se validó la técnica de tinte con la foto real `references/101.png` (1000×1143, RGB, fondo opaco) y una máscara generada por umbral: una sola foto neutra (camiseta blanca) se tiñe a cualquier color con `mix-blend-mode: multiply` recortado por una **máscara alfa** del garment, conservando pliegues y sombras.

## Decisiones tomadas

1. **Técnica de tinte (A):** foto única neutra + **máscara alfa** del garment + capa de color con `mix-blend-mode: multiply`. Una foto sirve para todos los colores. La calidad de la máscara la garantiza el Subproyecto B; A renderiza contra el contrato.
2. **Geometría:** `printZone` como **ratios (0–1)** `{x,y,w,h}` + `rotation` en grados (caja + rotación, NO quad de perspectiva).
3. **Tira de miniaturas = perspectivas** (las `views` que ya existen: frente/espalda/mangas). Un set de modelo por producto. "Cambiar de modelo" queda para B.
4. **Enfoque de render:** CSS en vivo para la vista previa + `<canvas>` aparte para la descarga (Enfoque 1).
5. **Galería de solo lectura:** sin selector de color; el hex llega como prop derivada del color ya elegido en Design.

## Contrato de datos

Se extiende `EditorProductLifestyleMockup` en `types/editor-product.d.ts`:

```ts
export type EditorProductLifestyleMockup = {
  viewId: string
  kind?: 'lifestyle' | 'flat'        // 'lifestyle' = foto de modelo tintable; default 'flat'
  src: string                        // foto del modelo (prenda neutra/blanca, fondo opaco OK)
  width: number
  height: number

  // Tinte: alfa = prenda (1 dentro, 0 fuera). Su presencia HABILITA el tinte CSS.
  maskUrl?: string | null

  // Zona de impresión como RATIOS (0–1) + rotación en grados. `rotation` es lo nuevo.
  printZone?: { x: number; y: number; w: number; h: number; rotation: number } | null

  blendMode?: 'multiply' | 'screen' | 'overlay' | null  // default 'multiply'

  // Opcionales/ignorados para 'lifestyle' (la foto es neutra; el color sale del selector de Design)
  previewColorId?: string
  previewColorHex?: string
}
```

Reglas:
- `kind: 'lifestyle'` + `maskUrl` presente → se tiñe la prenda con el color seleccionado (`colors[].hex`) vía `multiply` recortado por la máscara alfa. Una sola foto para todos los colores.
- Sin `maskUrl` (o `kind: 'flat'`) → comportamiento actual: plantilla plana, sin tinte; el diseño se compone con `multiply` y, si no hay `printZone`, se deriva de `printArea` (fallback existente en `resolvePrintZone`).
- `printZone` en ratios → resolución-independiente. `rotation` rota tanto la caja como el diseño dentro de ella.
- `maskUrl`: PNG cuyo **canal alfa** marca la prenda; se escala al 100% del frame (`mask-size: 100% 100%`), no necesita igualar dimensiones exactas. (CSS enmascara por alfa por defecto: una máscara en escala de grises opaca NO recorta — debe ser alfa.)

## Componentes y flujo

### `app/pages/design/[id].vue` (cambio mínimo)
Ya tiene `selectedColor` (computed) y `editor.value.mockups`. Cambio: pasar el hex al gallery como prop nueva de solo lectura:

```vue
<DesignMockupGallery
  ...
  :selected-color-id="selectedColorId"
  :selected-color-hex="selectedColor?.hex ?? ''"
  :active-view-id="activeViewId"
/>
```

### `app/components/design/MockupGallery.vue` (cambio principal)

**Selección por vista** (`mockupsByView`), por cada `view`:
1. Si hay un mockup `lifestyle` con `maskUrl` para ese `viewId` → se usa esa foto y se **tiñe**. (No se filtra por color.)
2. Si no → mockup plano por color (`previewColorId === selectedColorId ?? primero`). Comportamiento actual.
3. Si tampoco → `view.mockup` (plantilla plana base).

**Vista previa en vivo (CSS, solo lectura).** Por cada vista mostrada (preview grande y cada miniatura), tres capas en un contenedor `position: relative`:
1. **Foto del modelo** — `<img>`, capa base.
2. **Capa de tinte** (solo si lifestyle + `maskUrl`) — `<div>` con `background: <selectedColorHex>`, `mix-blend-mode: multiply`, `-webkit-mask-image`/`mask-image: url(maskUrl)`, `mask-size: 100% 100%`, `mask-repeat: no-repeat`. Tiñe solo la prenda; conserva pliegues/sombras.
3. **Diseño** — `<img>` de `designOverlayUrls[viewId]`, posicionado en la caja `printZone` (en %), `transform: rotate(printZone.rotation deg)`, `mix-blend-mode: blendMode (default multiply)`.

Las miniaturas usan las mismas tres capas (versión chica) para reflejar el resultado teñido real.

### Descarga / exportación (`downloadMockup`, extensión del canvas existente)
1. Dibujar la foto base.
2. Si hay `maskUrl`: construir la capa de tinte enmascarado y componerla sobre la foto. Técnica: en un canvas temporal, pintar el rectángulo del color, aplicar la máscara con `globalCompositeOperation = 'destination-in'` (recorta el color a la prenda), y dibujar ese resultado sobre la foto con `globalCompositeOperation = 'multiply'`.
3. Dibujar el diseño en la `printZone` con rotación y `blendMode`.
4. Exportar a PNG (igual que hoy).

Todas las imágenes se cargan con `crossOrigin = 'anonymous'` (ya lo hace `loadImageForCanvas`) para evitar canvas "tainted".

## Pruebas locales (sin Subproyecto B)

- Copiar assets de muestra a `public/` (p. ej. `public/mockups/sample/101.png` y `101-mask.png`).
- Helper **solo en dev** (`import.meta.dev`) que inyecta **un** mockup `lifestyle` para la vista frontal del producto de prueba dentro de `editor.value.mockups`, apuntando a esos assets con su `printZone` y `maskUrl`. En producción no se toca nada: sin mockups lifestyle del backend, sigue el fallback plano.
- Permite verificar el render completo (preview + miniaturas + descarga) end-to-end de inmediato.

## i18n

No se esperan cadenas nuevas visibles (la galería ya tiene sus claves). Cualquier cadena nueva (p. ej. una etiqueta "Vista previa") va en `i18n/locales/en.json` y `es.json` a la vez.

## Fuera de alcance (Subproyecto B)

- Calibrador visual en el admin (arrastrar/rotar la caja, generar/limpiar la máscara) para admin no técnico.
- Pipeline que produce máscaras limpias por foto.
- Librería de modelos (modelo × perspectivas, ~4–5 modelos × hasta 6 perspectivas ≈ 30 fotos reusables) y asignación producto↔mockup.
- Selección de múltiples modelos por el cliente.

## Criterios de aceptación

- Un producto con un mockup `lifestyle` muestra en la pestaña Mockups la foto del modelo con la prenda teñida al color elegido en Design y el diseño compuesto en la `printZone` (con rotación), tanto en el preview grande como en las miniaturas.
- Cambiar el color en Design se refleja en el tinte de Mockups (solo lectura, sin selector en la galería).
- La descarga produce un PNG con foto + tinte enmascarado + diseño, equivalente a la vista previa.
- Un producto **sin** mockups lifestyle se comporta exactamente como hoy (plantilla plana, sin tinte).
- El tinte afecta únicamente a la prenda (no piel, fondo, accesorios), recortado por la máscara alfa.
```
