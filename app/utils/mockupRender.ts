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
    return { zone: mockup.printZone, blendMode: mockup.blendMode ?? 'multiply' }
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
    blendMode: mockup?.blendMode ?? 'multiply',
  }
}
