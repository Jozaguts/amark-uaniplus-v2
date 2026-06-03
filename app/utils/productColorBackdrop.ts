export interface ImageLayoutBox {
  x: number
  y: number
  width: number
  height: number
}

export interface ColorBackdropConfig extends ImageLayoutBox {
  fill: string
  listening: false
  name: 'product-color-backdrop'
}

/**
 * Konva rect config painted behind the base product image so the selected
 * color shows through the transparent garment pixels, contained to the image
 * rectangle. Returns null when no color should be applied.
 */
export function buildColorBackdropConfig(
  layout: ImageLayoutBox | null | undefined,
  colorHex: string | null | undefined,
  hasColors: boolean,
): ColorBackdropConfig | null {
  if (!layout || !hasColors || !colorHex) {
    return null
  }

  return {
    x: layout.x,
    y: layout.y,
    width: layout.width,
    height: layout.height,
    fill: colorHex,
    listening: false,
    name: 'product-color-backdrop',
  }
}
