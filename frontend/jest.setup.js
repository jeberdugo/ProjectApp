import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useParams: () => ({}),
  usePathname: jest.fn(() => '/'),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock fetch
global.fetch = jest.fn()

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock DataTransfer for drag and drop tests
class MockDataTransfer {
  constructor() {
    this.effectAllowed = 'none'
    this.dropEffect = 'none'
    this.files = []
    this.items = []
    this.types = []
  }
  
  clearData() {}
  getData() { return '' }
  setData() {}
  setDragImage() {}
}

Object.defineProperty(window, 'DataTransfer', {
  writable: true,
  value: MockDataTransfer,
})

// Mock DragEvent
Object.defineProperty(window, 'DragEvent', {
  writable: true,
  value: class MockDragEvent extends Event {
    constructor(type, eventInitDict = {}) {
      super(type, eventInitDict)
      this.dataTransfer = new MockDataTransfer()
    }
  },
})