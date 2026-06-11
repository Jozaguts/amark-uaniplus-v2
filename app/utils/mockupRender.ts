import type { CSSProperties } from 'vue'
import type { EditorProductLifestyleMockup, EditorProductView } from '~~/types/editor-product'

export function isLifestyle(mockup: EditorProductLifestyleMockup | null): boolean {
  return !!mockup && mockup.kind === 'lifestyle' && !!mockup.maskUrl
}

export function selectMockupForView(
  mockups: EditorProductLifestyleMockup[],
  view: EditorProductView,
  selectedColorId: string,
): EditorProductLifestyleMockup | null {
  const candidates = mockups.filter(mockup => mockup.viewId === view.id)
  const lifestyle = candidates.find(isLifestyle)
  if (lifestyle) return lifestyle
  return candidates.find(mockup => mockup.previewColorId === selectedColorId) ?? candidates[0] ?? null
}

export type ResolvedPrintZone = {
  zone: { x: number; y: number; w: number; h: number; rotation: number }
  blendMode: NonNullable<EditorProductLifestyleMockup['blendMode']>
}

export function resolvePrintZone(
  view: EditorProductView,
  mockup: EditorProductLifestyleMockup | null,
): ResolvedPrintZone | null {
  if (mockup?.printZone) {
    return { zone: mockup.printZone, blendMode: mockup.blendMode ?? 'normal' }
  }

  const area = view.printArea
  const base = view.mockup

  if (!area || !base?.width || !base?.height) return null

  return {
    zone: {
      x: area.x / base.width,
      y: area.y / base.height,
      w: area.width / base.width,
      h: area.height / base.height,
      rotation: 0,
    },
    blendMode: mockup?.blendMode ?? 'normal',
  }
}

export function tintLayerStyle(maskUrl: string, colorHex: string): CSSProperties {
  const mask = `url("${maskUrl}")`
  return {
    backgroundColor: colorHex,
    mixBlendMode: 'multiply',
    WebkitMaskImage: mask,
    maskImage: mask,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  }
}

export function designOverlayStyle(
  zone: ResolvedPrintZone['zone'],
  blendMode: NonNullable<EditorProductLifestyleMockup['blendMode']>,
): CSSProperties {
  return {
    left: `${zone.x * 100}%`,
    top: `${zone.y * 100}%`,
    width: `${zone.w * 100}%`,
    height: `${zone.h * 100}%`,
    transform: zone.rotation ? `rotate(${zone.rotation}deg)` : undefined,
    mixBlendMode: blendMode,
  }
}
