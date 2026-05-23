import { Progress } from '../progress.vo'

describe('Progress', () => {
  it('calculates missing stickers', () => {
    const progress = new Progress(100, 70, 5)
    expect(progress.missing).toBe(30)
  })

  it('does not return negative missing', () => {
    const progress = new Progress(100, 150, 0)
    expect(progress.missing).toBe(0)
  })

  it('calculates percentage', () => {
    const progress = new Progress(200, 50, 0)
    expect(progress.percentage).toBe(25)
  })

  it('returns 0 percentage when total is 0', () => {
    const progress = new Progress(0, 0, 0)
    expect(progress.percentage).toBe(0)
  })

  it('rounds percentage correctly', () => {
    const progress = new Progress(3, 1, 0)
    expect(progress.percentage).toBe(33)
  })

  it('formats percentage with % sign', () => {
    const progress = new Progress(100, 50, 0)
    expect(progress.formattedPercentage).toBe('50%')
  })

  it('is complete when no stickers missing', () => {
    const progress = new Progress(100, 100, 0)
    expect(progress.isComplete).toBe(true)
  })

  it('is not complete when stickers missing', () => {
    const progress = new Progress(100, 99, 0)
    expect(progress.isComplete).toBe(false)
  })

  it('is not complete when total is 0', () => {
    const progress = new Progress(0, 0, 0)
    expect(progress.isComplete).toBe(true)
  })

  it('compares equality', () => {
    const a = new Progress(100, 50, 5)
    const b = new Progress(100, 50, 5)
    const c = new Progress(100, 51, 5)
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })

  it('is immutable', () => {
    const progress = new Progress(100, 50, 5)
    expect(Object.isFrozen(progress)).toBe(true)
  })
})
