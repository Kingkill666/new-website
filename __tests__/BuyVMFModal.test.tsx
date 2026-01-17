import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BuyVMFModal } from '@/components/buy-vmf-modal'

jest.mock('@reown/appkit/react', () => ({
  useAppKit: () => ({
    open: jest.fn(),
    close: jest.fn(),
  }),
}))

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: () => ({
    address: undefined,
    isConnected: false,
    chain: undefined,
  }),
  useDisconnect: () => ({
    disconnect: jest.fn(),
  }),
  useSwitchChain: () => ({
    switchChain: jest.fn(),
  }),
}))

// Mock the oracle utils
jest.mock('@/lib/oracle-utils', () => ({
  calculateVMFAmount: jest.fn().mockResolvedValue(100),
  getPriceInfo: jest.fn().mockResolvedValue({ price: 1, source: 'Mock' }),
  getPriceInfoNoProvider: jest.fn().mockResolvedValue({ price: 1, source: 'Mock' }),
}))

// Mock network utils
jest.mock('@/lib/network-utils', () => ({
  isBaseNetwork: jest.fn().mockReturnValue(false),
  switchToBaseNetwork: jest.fn(),
  getNetworkName: jest.fn().mockReturnValue('Unknown'),
  forceBaseNetwork: jest.fn(),
}))

describe('BuyVMFModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    render(<BuyVMFModal isOpen={false} onClose={mockOnClose} />)

    // Modal should not be in the document
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('BUY VMF')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(<BuyVMFModal isOpen={true} onClose={mockOnClose} />)

    // Modal should be in the document
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('BUY VMF')).toBeInTheDocument()
  })

  it('displays the modal title correctly', () => {
    render(<BuyVMFModal isOpen={true} onClose={mockOnClose} />)

    expect(screen.getByText('BUY VMF')).toBeInTheDocument()
  })

  it('has a close button that calls onClose when clicked', () => {
    render(<BuyVMFModal isOpen={true} onClose={mockOnClose} />)

    const closeButton = screen.getByLabelText('Close modal')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('closes when Escape key is pressed', () => {
    render(<BuyVMFModal isOpen={true} onClose={mockOnClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('shows wallet connection prompt when not connected', () => {
    render(<BuyVMFModal isOpen={true} onClose={mockOnClose} />)

    expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument()
    expect(
      screen.getByText(/Reown WalletKit opens automatically so you can pick Coinbase, MetaMask, Farcaster, Rainbow/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Open Reown WalletKit/i })).toBeInTheDocument()
  })

  it('shows amount input field', () => {
    render(<BuyVMFModal isOpen={true} onClose={mockOnClose} />)

    const amountInput = screen.getByLabelText('AMOUNT $')
    expect(amountInput).toBeInTheDocument()
    expect(amountInput).toHaveAttribute('type', 'number')
  })

  it('shows Reown WalletKit prompt on mobile environments', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true,
    })

    render(<BuyVMFModal isOpen={true} onClose={mockOnClose} />)

    expect(screen.getByRole('button', { name: /Open Reown WalletKit/i })).toBeInTheDocument()
  })

  it('shows AppKit button on desktop', () => {
    // Mock desktop user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true,
    })

    render(<BuyVMFModal isOpen={true} onClose={mockOnClose} />)

    // Should show the appkit-button (though we can't test the actual component)
    // The modal should still render without errors
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('prevents body scroll when modal is open', () => {
    // Mock document.body.style
    const originalOverflow = document.body.style.overflow
    Object.defineProperty(document.body.style, 'overflow', {
      writable: true,
      value: 'unset',
    })

    const { unmount } = render(<BuyVMFModal isOpen={true} onClose={mockOnClose} />)

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('unset')

    // Restore original value
    document.body.style.overflow = originalOverflow
  })

  it('focuses the modal when opened', async () => {
    render(<BuyVMFModal isOpen={true} onClose={mockOnClose} />)

    await waitFor(() => {
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveFocus()
    })
  })

  it('traps focus within the modal', () => {
    render(<BuyVMFModal isOpen={true} onClose={mockOnClose} />)

    const modal = screen.getByRole('dialog')
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length > 1) {
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      // Tab from last element should go to first element
      lastElement.focus()
      fireEvent.keyDown(lastElement, { key: 'Tab' })

      expect(firstElement).toHaveFocus()
    }
  })
})
