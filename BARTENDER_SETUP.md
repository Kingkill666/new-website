# Bartender OpenAI API Setup

## Overview
The bartender chatbot has been upgraded to use OpenAI's GPT models for more intelligent and contextual responses. The system will automatically fall back to local responses if the OpenAI API is not configured.

## Setup Instructions

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Create a new API key
4. Copy the API key (starts with `sk-`)

### 2. Configure Environment Variables
Create a `.env.local` file in your project root with the following variables:

```bash
# Your OpenAI API Key
NEXT_PUBLIC_OPENAI_API_KEY=sk-your_api_key_here

# Optional: OpenAI Model (default: gpt-3.5-turbo)
NEXT_PUBLIC_OPENAI_MODEL=gpt-3.5-turbo

# Optional: Max tokens per response (default: 150)
NEXT_PUBLIC_OPENAI_MAX_TOKENS=150

# Optional: Temperature for response creativity (default: 0.7)
NEXT_PUBLIC_OPENAI_TEMPERATURE=0.7
```

### 3. Restart Development Server
After adding the environment variables, restart your development server:

```bash
npm run dev
```

## Features

### OpenAI Integration
- **Real-time AI responses** using GPT-3.5-turbo
- **Contextual conversations** that remember previous messages
- **Bartender personality** maintained through system prompts
- **Automatic fallback** to local responses if API is unavailable

### Local Fallback
- **No API key required** for basic functionality
- **Pre-programmed responses** for common interactions
- **Bartender personality** maintained even without AI
- **Seamless experience** regardless of configuration

## Cost Considerations
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **Typical conversation**: 50-100 tokens per response
- **Estimated cost**: $0.01-0.05 per conversation
- **Free tier**: $5 credit for new OpenAI accounts

## Troubleshooting

### API Key Issues
- Ensure your API key starts with `sk-`
- Check that you have sufficient credits in your OpenAI account
- Verify the API key is correctly set in `.env.local`

### Fallback Mode
If you see "OpenAI API not configured, using local responses" in the console, the system is working in fallback mode. This is normal if no API key is configured.

### Error Handling
The system automatically handles API errors and falls back to local responses, ensuring the bartender chat always works.

## Security Notes
- Never commit your `.env.local` file to version control
- The API key is exposed to the client (NEXT_PUBLIC_ prefix)
- For production, consider using a backend proxy for API calls 