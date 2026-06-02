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
