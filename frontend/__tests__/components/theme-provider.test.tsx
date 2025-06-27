import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, enableSystem, storageKey, forcedTheme, defaultTheme, disableTransitionOnChange, ...safeProps }: any) => {
    const dataProps: any = {}
    if (enableSystem) dataProps['data-enable-system'] = 'true'
    if (storageKey) dataProps['data-storage-key'] = storageKey
    if (forcedTheme) dataProps['data-forced-theme'] = forcedTheme
    if (defaultTheme) dataProps['data-default-theme'] = defaultTheme
    if (disableTransitionOnChange) dataProps['data-disable-transition'] = 'true'
    
    return (
      <div data-testid="theme-provider" {...safeProps} {...dataProps}>
        {children}
      </div>
    )
  },
}))

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
  })

  it('passes props to NextThemesProvider', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div>Test Content</div>
      </ThemeProvider>
    )

    const provider = screen.getByTestId('theme-provider')
    expect(provider).toHaveAttribute('attribute', 'class')
    expect(provider).toHaveAttribute('data-default-theme', 'dark')
  })

  it('renders without props', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('handles multiple children', () => {
    render(
      <ThemeProvider>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </ThemeProvider>
    )

    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
    expect(screen.getByText('Third Child')).toBeInTheDocument()
  })

  it('forwards all theme provider props', () => {
    const props = {
      attribute: 'data-theme',
      defaultTheme: 'system',
      enableSystem: true,
      disableTransitionOnChange: false,
      storageKey: 'theme',
      themes: ['light', 'dark', 'system'],
      forcedTheme: undefined,
      value: undefined,
    }

    render(
      <ThemeProvider {...props}>
        <div>Test Content</div>
      </ThemeProvider>
    )

    const provider = screen.getByTestId('theme-provider')
    expect(provider).toHaveAttribute('attribute', 'data-theme')
    expect(provider).toHaveAttribute('data-default-theme', 'system')
    expect(provider).toHaveAttribute('data-enable-system', 'true')
    expect(provider).toHaveAttribute('data-storage-key', 'theme')
  })
})