import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateEmailTemplate = async ({ prompt, tone, purpose, groupName }) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const fullPrompt = `
      Generate an email template for a group called "${groupName}".
      Purpose: ${purpose}
      Tone: ${tone}
      Additional requirements: ${prompt}
      
      Please provide:
      1. A compelling subject line
      2. Email content with personalization placeholders like {{name}}, {{email}}, etc.
      3. List any variables used for personalization
      
      Format the response as JSON with the following structure:
      {
        "subject": "subject line here",
        "content": "email content with HTML formatting",
        "variables": [
          {"name": "name", "placeholder": "{{name}}"},
          {"name": "email", "placeholder": "{{email}}"}
        ]
      }
      
      Make sure the email follows best practices to avoid spam filters:
      - Include proper unsubscribe information
      - Use professional language
      - Have a good text-to-image ratio
      - Include contact information
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid response format from AI');
    }
  } catch (error) {
    console.error('Error generating AI template:', error);
    throw error;
  }
};
