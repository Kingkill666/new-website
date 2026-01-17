import '@testing-library/jest-dom'

// Mock window.ethereum for testing
Object.defineProperty(window, 'ethereum', {
  writable: true,
  value: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    isMetaMask: true,
  },
})

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
  writable: true,
})

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
}))

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    BrowserProvider: jest.fn(),
    Contract: jest.fn(),
    parseUnits: jest.fn(),
    formatEther: jest.fn(),
  },
}))