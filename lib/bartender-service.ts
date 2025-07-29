// Bartender Service - Integration with OpenAI API
// Based on https://github.com/mimrock/Bartender

import { getOpenAIConfigFromEnv, validateOpenAIConfig } from './openai-config'

interface BartenderConfig {
  apiUrl?: string
  apiKey?: string
  model?: string
  maxTokens?: number
  temperature?: number
}

interface BartenderMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export class BartenderService {
  private config: BartenderConfig
  private conversationHistory: BartenderMessage[] = []

  constructor(config: BartenderConfig = {}) {
    // Get OpenAI config from environment variables
    const openAIConfig = getOpenAIConfigFromEnv()
    
    this.config = {
      apiUrl: "https://api.openai.com/v1/chat/completions",
      model: openAIConfig.model,
      maxTokens: openAIConfig.maxTokens,
      temperature: openAIConfig.temperature,
      apiKey: openAIConfig.apiKey,
      ...config
    }
    
    // Initialize with bartender personality
    this.conversationHistory.push({
      role: "system",
      content: `You are a friendly bartender at the Officers Club Bar, a virtual space for veterans and military families. 
      You have a warm, welcoming personality and love to chat with patrons. You can:
      - Recommend drinks and cocktails
      - Share stories about the bar and its patrons
      - Discuss military and veteran topics respectfully
      - Provide information about the bar's amenities
      - Engage in casual conversation
      
      Keep responses conversational, friendly, and under 100 words. Use emojis occasionally to keep the mood light.
      Always be supportive and understanding of veterans and military families.`
    })
  }

  async sendMessage(userMessage: string): Promise<string> {
    // Add user message to history
    this.conversationHistory.push({
      role: "user",
      content: userMessage
    })

    try {
      // Try to use OpenAI API if configured
      if (this.config.apiKey && validateOpenAIConfig({ apiKey: this.config.apiKey, model: this.config.model!, maxTokens: this.config.maxTokens!, temperature: this.config.temperature! })) {
        return await this.callOpenAIAPI(userMessage)
      } else {
        // Fallback to local responses
        console.log("OpenAI API not configured, using local responses")
        return await this.getLocalResponse(userMessage)
      }
    } catch (error) {
      console.error("Bartender API error:", error)
      return await this.getLocalResponse(userMessage)
    }
  }

  private async callOpenAIAPI(userMessage: string): Promise<string> {
    const response = await fetch(this.config.apiUrl!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: this.conversationHistory,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API call failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const assistantMessage = data.choices[0].message.content

    // Add assistant response to history
    this.conversationHistory.push({
      role: "assistant",
      content: assistantMessage
    })

    // Keep conversation history manageable
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = [
        this.conversationHistory[0], // Keep system message
        ...this.conversationHistory.slice(-8) // Keep last 8 messages
      ]
    }

    return assistantMessage
  }

  private async getLocalResponse(userMessage: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const input = userMessage.toLowerCase()
    
    // Bartender personality responses
    if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
      return "Hello there! Welcome to the Officers Club Bar. What can I get you tonight? 🍺"
    }
    
    if (input.includes("drink") || input.includes("cocktail") || input.includes("beer")) {
      const drinks = [
        "I'd recommend our signature VMF Old Fashioned - it's got a patriotic twist! 🇺🇸",
        "How about a classic Manhattan? Perfect for unwinding after a long day.",
        "We've got a great selection of craft beers. Any particular style you prefer?",
        "Try our Officers Club Special - it's a secret recipe that's been passed down for generations!",
        "The VMF Victory Shot is popular here - it's our way of celebrating service members."
      ]
      return drinks[Math.floor(Math.random() * drinks.length)]
    }
    
    if (input.includes("story") || input.includes("tell me") || input.includes("experience")) {
      return "Ah, let me tell you about the time we had a whole battalion in here celebrating their return from deployment. The stories that night... well, let's just say this bar has seen its fair share of heroes. What's your story, friend? 🎖️"
    }
    
    if (input.includes("veteran") || input.includes("military") || input.includes("service")) {
      return "Thank you for your service! This bar was built for folks like you. We've got a special discount for veterans and their families. What branch did you serve in? 🇺🇸"
    }
    
    if (input.includes("food") || input.includes("eat") || input.includes("hungry")) {
      return "We've got some great bar food - wings, burgers, and our famous chili. The kitchen closes at 10 PM, so let me know if you want to order something! 🍔"
    }
    
    if (input.includes("music") || input.includes("jukebox") || input.includes("song")) {
      return "The jukebox over there has everything from classic rock to country. We've got a great selection of patriotic tunes too. What's your favorite genre? 🎵"
    }
    
    if (input.includes("help") || input.includes("assist")) {
      return "I'm here to help! I can tell you about our drinks, food, music, or just chat about life. What would you like to know? 🤝"
    }
    
    if (input.includes("bye") || input.includes("goodbye") || input.includes("see you")) {
      return "Take care, friend! Come back anytime. This bar will always be here for you. Stay safe out there! 👋"
    }
    
    if (input.includes("vmf") || input.includes("coin")) {
      return "Ah, VMF coins! That's our way of supporting veterans. Every purchase helps fund programs for military families. It's more than just a drink - it's a way to give back. 🪙"
    }
    
    if (input.includes("charity") || input.includes("donation")) {
      return "We partner with amazing veteran charities. Every drink you buy helps support organizations that help our heroes. It's what makes this place special - we're not just a bar, we're a community. ❤️"
    }
    
    // Default responses
    const defaultResponses = [
      "That's interesting! Tell me more about that.",
      "I've been tending bar here for years, and I've heard a lot of stories. What's on your mind?",
      "You know, this place has a way of bringing people together. What brings you here tonight?",
      "I'm all ears! What would you like to talk about?",
      "That's a good point. You know what they say - the best conversations happen at the bar.",
      "I've seen a lot of things in this bar over the years. What's your story?",
      "You know, every person who walks through that door has a story. What's yours?",
      "This bar has been here for generations of service members. It's more than just a place to drink - it's a home away from home."
    ]
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  clearHistory(): void {
    this.conversationHistory = [this.conversationHistory[0]] // Keep system message
  }

  // Method to configure OpenAI API
  configureOpenAI(apiKey: string, model?: string): void {
    this.config.apiKey = apiKey
    if (model) {
      this.config.model = model
    }
  }

  // Method to check if OpenAI is configured
  isOpenAIConfigured(): boolean {
    return !!(this.config.apiKey && this.config.apiKey.trim() !== '')
  }
}

// Export a singleton instance
export const bartenderService = new BartenderService() 