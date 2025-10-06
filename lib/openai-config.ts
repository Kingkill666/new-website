// OpenAI Configuration for Bartender Service

export interface OpenAIConfig {
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
}

// Default configuration
export const defaultOpenAIConfig: OpenAIConfig = {
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  model: 'gpt-3.5-turbo',
  maxTokens: 150,
  temperature: 0.7
}

// Function to validate OpenAI configuration
export function validateOpenAIConfig(config: OpenAIConfig): boolean {
  return !!(config.apiKey && config.apiKey.trim() !== '')
}

// Function to get configuration from environment variables
export function getOpenAIConfigFromEnv(): OpenAIConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.NEXT_PUBLIC_OPENAI_MAX_TOKENS || '150'),
    temperature: parseFloat(process.env.NEXT_PUBLIC_OPENAI_TEMPERATURE || '0.7')
  }
} 