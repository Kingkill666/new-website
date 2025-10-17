import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a query client for React Query
const queryClient = new QueryClient()

// Privy configuration
export const privyConfig = {
  appId: 'cmgsymufm00cmjy0dc7kkap24',
  config: {
    // Customize the appearance of the Privy modal
    appearance: {
      theme: 'light',
      accentColor: '#ef4444', // Red theme to match your VMF branding
      logo: '/placeholder-logo.png',
    },
    // Configure login methods
    loginMethods: ['wallet', 'email', 'sms', 'google', 'twitter', 'discord'],
    // Configure embedded wallets
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      requireUserPasswordOnCreate: false,
    },
    // Configure supported wallets
    externalWallets: {
      coinbaseWallet: {
        connectionOptions: 'smartWalletOnly',
      },
      metamask: {
        connectionOptions: 'both',
      },
      walletConnect: {
        connectionOptions: 'both',
      },
    },
    // Configure legal and privacy
    legal: {
      termsAndConditionsUrl: 'https://your-terms-url.com',
      privacyPolicyUrl: 'https://your-privacy-url.com',
    },
  },
}

// Export the providers for use in the app
export { PrivyProvider, QueryClientProvider, queryClient }
