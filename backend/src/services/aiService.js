// src/services/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateEmailTemplate(prompt, groupName, purpose) {
    try {
      const enhancedPrompt = `
        Create an email template for the group "${groupName}" with the purpose: "${purpose}"
        
        User prompt: ${prompt}
        
        Please generate:
        1. A compelling subject line
        2. HTML email content with proper formatting
        3. Include placeholders like {{name}}, {{company}} for personalization
        4. Make it professional and engaging
        
        Return the response in JSON format:
        {
          "subject": "subject line here",
          "htmlContent": "html content here",
          "textContent": "plain text version here",
          "variables": ["name", "company", "other_variables"]
        }
      `;

      const result = await this.model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      try {
        const jsonResponse = JSON.parse(text);
        return jsonResponse;
      } catch (parseError) {
        // If JSON parsing fails, create a structured response
        return {
          subject: `${purpose} - ${groupName}`,
          htmlContent: `<div>${text}</div>`,
          textContent: text.replace(/<[^>]*>/g, ''),
          variables: ['name']
        };
      }
    } catch (error) {
      throw new Error(`AI template generation failed: ${error.message}`);
    }
  }
}

export default new AIService();
