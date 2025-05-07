import { NextResponse } from 'next/server';

// Allow responses up to 30 seconds
export const maxDuration = 30

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://techlo-design-solutions.app.n8n.cloud/webhook/9cd82bc0-b150-4c28-b814-c779aa005d2f'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content;
    
    console.log('Sending to n8n:', userMessage);
    
    // Make a simple request to n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: userMessage
      }),
    });
    
    console.log('n8n response status:', response.status);
    
    // Log the raw response text
    const responseText = await response.text();
    console.log('n8n raw response:', responseText);
    
    // Try to parse as JSON if possible
    let content = "Sorry, I couldn't process your request.";
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
      
      // Try to extract the response from various possible locations
      if (typeof data === 'string') content = data;
      else if (data.data) content = data.data;
      else if (data.output) content = data.output;
      else if (data.result) content = data.result;
      else if (data.response) content = data.response;
      else content = JSON.stringify(data);
    } catch (e) {
      // If not JSON, use the raw text
      content = responseText;
    }
    
    return NextResponse.json({
      role: 'assistant',
      content: content
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
