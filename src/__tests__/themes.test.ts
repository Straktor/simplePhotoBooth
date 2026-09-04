import { describe, it, expect } from 'vitest'
import { resolveTheme, isColorLight } from '../themes'
import type { CustomThemeVariants } from '../themes'

describe('themes', () => {
  it('identifies light and dark colors correctly', () => {
    expect(isColorLight('#ffffff')).toBe(true)
    expect(isColorLight('#f5f5f5')).toBe(true)
    expect(isColorLight('#000000')).toBe(false)
    expect(isColorLight('#09090f')).toBe(false)
    expect(isColorLight('#1c1c1e')).toBe(false)
  })

  it('resolves standard preset themes', () => {
    const darkNeon = resolveTheme('neon', {} as any, true)
    expect(darkNeon.label).toBe('Dark Neon')
    expect(darkNeon.darkFrame).toBe(true)
    expect(darkNeon.primary).toBe('#7c6fff')

    const lightNeon = resolveTheme('neon', {} as any, false)
    expect(lightNeon.darkFrame).toBe(false)
    expect(lightNeon.text).toBe('#1a1530')
  })

  it('resolves custom theme with proper light/dark contrast', () => {
    const customCfg: CustomThemeVariants = {
      dark: { primary: '#7c6fff', accent: '#ff6b9d', bg: '#09090f', bgImage: null },
      light: { primary: '#7c6fff', accent: '#ff6b9d', bg: '#f5f5f5', bgImage: null },
    }

    const darkCustom = resolveTheme('custom', customCfg, true)
    expect(darkCustom.text).toBe('#f0f0f0')
    expect(darkCustom.darkFrame).toBe(true)
    expect(darkCustom.bg).toBe('#09090f')

    const lightCustom = resolveTheme('custom', customCfg, false)
    expect(lightCustom.text).toBe('#1a1a1a')
    expect(lightCustom.darkFrame).toBe(false)
    expect(lightCustom.bg).toBe('#f5f5f5')
  })

  it('applies custom font override when provided', () => {
    const customCfg: CustomThemeVariants = {
      dark: { primary: '#7c6fff', accent: '#ff6b9d', bg: '#09090f', bgImage: null },
      light: { primary: '#7c6fff', accent: '#ff6b9d', bg: '#f5f5f5', bgImage: null },
    }

    const fontOverride = 'Georgia, serif'
    const theme = resolveTheme('neon', customCfg, true, fontOverride)
    expect(theme.font).toBe(fontOverride)
  })
})
