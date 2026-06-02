import type { EditorProductLifestyleMockup, EditorProductView } from '~~/types/editor-product'

// Dev-only: inject one sample lifestyle mockup so the tint/compositing path is
// exercisable before the backend (Subproject B) produces real mockups. No-op in
// production and when the product already ships lifestyle mockups.
export function withDevLifestyleMockups(
  mockups: EditorProductLifestyleMockup[],
  views: EditorProductView[],
): EditorProductLifestyleMockup[] {
  if (!import.meta.dev) return mockups

  const front = views[0]
  if (!front) return mockups
  if (mockups.some(mockup => mockup.kind === 'lifestyle')) return mockups

  return [
    ...mockups,
    {
      viewId: front.id,
      kind: 'lifestyle',
      src: '/mockups/sample/model-front.jpg',
      width: 560,
      height: 640,
      maskUrl: '/mockups/sample/model-front-mask.png',
      printZone: { x: 0.335, y: 0.45, w: 0.33, h: 0.27, rotation: 0 },
      blendMode: 'multiply',
    },
  ]
}
