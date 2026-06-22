import { describe, expect, it } from 'vitest'
import { catalogNavigationState } from './catalogNavigationState'

describe('catalogNavigationState', () => {
  it('allows navigation only when is_clickable is exactly true', () => {
    expect(catalogNavigationState({ is_clickable: true, children: [] }).canNavigate).toBe(true)
    expect(catalogNavigationState({ is_clickable: false, children: [] }).canNavigate).toBe(false)
    expect(catalogNavigationState({ children: [] }).canNavigate).toBe(false)
  })

  it('detects dropdown content independently from clickability', () => {
    const child = { is_clickable: true, children: [] }

    expect(catalogNavigationState({ is_clickable: false, children: [child] })).toEqual({
      canNavigate: false,
      hasChildren: true,
    })
    expect(catalogNavigationState({ is_clickable: true, children: [] })).toEqual({
      canNavigate: true,
      hasChildren: false,
    })
  })
})
