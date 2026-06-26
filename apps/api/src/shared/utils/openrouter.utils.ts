import { config } from '../../config';

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export const callOpenRouter = async (messages: OpenRouterMessage[]): Promise<string> => {
  const response = await fetch(`${config.openrouter.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openrouter.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.openrouter.model,
      messages,
    }),
  });

  const data = await response.json() as any;
  
  // log the full response so we can see what's coming back
  console.log('OpenRouter response:', JSON.stringify(data, null, 2));

  if (!data.choices || !data.choices[0]) {
    throw new Error(`OpenRouter error: ${JSON.stringify(data)}`);
  }

  return data.choices[0].message.content;
};