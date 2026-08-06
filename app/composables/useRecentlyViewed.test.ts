import { describe, expect, it } from 'vitest'
import {
  normalizeRecentlyViewedList,
  prependRecentlyViewed,
  type RecentlyViewedProduct,
} from './useRecentlyViewed'

function item(slug: string, viewedAt = Date.now()): RecentlyViewedProduct {
  return {
    slug,
    name: slug,
    image: `/img/${slug}.jpg`,
    url: `/products/${slug}`,
    viewedAt,
  }
}

describe('useRecentlyViewed helpers', () => {
  it('keeps at most 4 unique products, most recent first', () => {
    let list: RecentlyViewedProduct[] = []
    list = prependRecentlyViewed(list, item('a', 1))
    list = prependRecentlyViewed(list, item('b', 2))
    list = prependRecentlyViewed(list, item('c', 3))
    list = prependRecentlyViewed(list, item('d', 4))
    list = prependRecentlyViewed(list, item('e', 5))

    expect(list.map(i => i.slug)).toEqual(['e', 'd', 'c', 'b'])
  })

  it('moves a re-viewed product to the front without duplicating', () => {
    let list = [item('a', 1), item('b', 2), item('c', 3)]
    list = prependRecentlyViewed(list, item('a', 10))

    expect(list.map(i => i.slug)).toEqual(['a', 'b', 'c'])
  })

  it('drops invalid / duplicate entries on normalize', () => {
    const list = normalizeRecentlyViewedList([
      item('a'),
      { ...item('a'), name: 'dup' },
      { slug: '', name: 'bad', image: '', url: '', viewedAt: 1 },
      item('b'),
    ])

    expect(list.map(i => i.slug)).toEqual(['a', 'b'])
  })
})
