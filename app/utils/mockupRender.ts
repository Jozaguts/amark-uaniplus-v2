import type { EditorProductLifestyleMockup } from '~~/types/editor-product'

export function isLifestyle(mockup: EditorProductLifestyleMockup | null): boolean {
  return !!mockup && mockup.kind === 'lifestyle' && !!mockup.maskUrl
}
