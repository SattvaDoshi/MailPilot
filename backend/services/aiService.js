import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateEmailTemplate = async ({ prompt, tone, purpose, groupName }) => {
  try {
    console.log("Using API key:", process.env.GEMINI_API_KEY);

    const fullPrompt = `
      Generate a high-deliverability email template for a group called "${groupName}".
      Purpose: ${purpose}
      Tone: ${tone}
      Additional requirements: ${prompt}
      
      CRITICAL ANTI-SPAM REQUIREMENTS:
      
      1. SUBJECT LINE RULES:
         - Keep under 50 characters for mobile compatibility
         - Avoid these spam trigger words: FREE, URGENT, WINNER, GUARANTEED, ACT NOW, LIMITED TIME, CONGRATULATIONS, CLICK HERE
         - Use specific, relevant language instead of generic marketing terms
         - Avoid excessive punctuation (!!!, ???) and ALL CAPS
         - Make it personal and conversational, not salesy
      
      2. EMAIL CONTENT REQUIREMENTS:
         - Use conversational, professional language - avoid overly promotional tone
         - Include genuine value proposition, not just sales pitch
         - Maintain 70% text to 30% formatting/HTML ratio
         - Avoid excessive use of colors, fonts, or formatting
         - Include proper sender identification
         - Add legitimate business context and reason for contact
         - Use specific details rather than vague promises
         - Include clear, single call-to-action (not multiple competing CTAs)
      
      3. TRUST SIGNALS TO INCLUDE:
         - Professional sender information
         - Clear unsubscribe mechanism
         - Physical address or contact information
         - Reason why recipient is receiving this email
         - Opt-out language that sounds genuine, not legal jargon
      
      4. PERSONALIZATION STRATEGY:
         - Use meaningful personalization beyond just name
         - Make personalization feel natural and contextual
         - Available placeholders: {{name}}, {{email}}, {{company}}, {{location}}
      
      5. TECHNICAL REQUIREMENTS:
         - Clean HTML with minimal inline CSS
         - Mobile-responsive design
         - Proper alt text for images (if any)
         - Text version compatibility
         - Standard email client compatibility
      
      6. CONTENT STRUCTURE:
         - Start with personal greeting
         - Clear reason for email in opening paragraph  
         - Value-focused body content (what's in it for them)
         - Single, clear call-to-action
         - Professional signature with contact info
         - Legitimate unsubscribe information
         - Physical address or business information
      
      7. LANGUAGE GUIDELINES:
         - Use active voice instead of passive
         - Write in second person (you/your) to be conversational
         - Avoid hyperbolic language (amazing, incredible, revolutionary)
         - Use specific numbers and facts instead of vague claims
         - Make requests politely, not demandingly
         - Focus on recipient benefits, not sender needs
      
      Please provide:
      1. A compelling, spam-filter-friendly subject line
      2. Email content with proper HTML formatting and personalization placeholders
      3. List of variables used for personalization
      
      Format the response as JSON with the following structure:
      {
        "subject": "subject line here",
        "content": "email content with proper HTML formatting and anti-spam optimizations",
        "variables": [
          {"name": "name", "placeholder": "{{name}}"},
          {"name": "email", "placeholder": "{{email}}"}
        ]
      }
      
      ADDITIONAL SPAM PREVENTION MEASURES:
      - Ensure content reads naturally when personalization is removed
      - Include proper email headers structure in HTML
      - Add legitimate business context
      - Use professional email signatures
      - Include clear sender identity
      - Provide easy unsubscribe process
      - Add contact information
      - Use permission-based language ("You're receiving this because...")
      - Avoid image-heavy layouts
      - Include sufficient text content
      - Use standard, readable fonts
      - Maintain professional formatting without excessive styling
      
      Make the email sound like it's coming from a real person to real people, not a marketing machine.
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7, // Balanced creativity
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 3072,
      }
    });
    
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    // Enhanced JSON extraction with better error handling
    let jsonText = text.trim();
    
    // Remove any markdown formatting that might interfere
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find the JSON object more reliably
    const startIndex = jsonText.indexOf('{');
    const lastIndex = jsonText.lastIndexOf('}');
    
    if (startIndex === -1 || lastIndex === -1) {
      throw new Error("Invalid response format from AI - no JSON found");
    }
    
    jsonText = jsonText.substring(startIndex, lastIndex + 1);
    
    // Parse the JSON
    const parsedResult = JSON.parse(jsonText);
    
    // Validate the response structure
    if (!parsedResult.subject || !parsedResult.content || !parsedResult.variables) {
      throw new Error("Invalid response structure - missing required fields");
    }
    
    // Post-process to ensure anti-spam compliance
    const optimizedResult = {
      subject: optimizeSubjectLine(parsedResult.subject),
      content: optimizeEmailContent(parsedResult.content),
      variables: parsedResult.variables || [
        {"name": "name", "placeholder": "{{name}}"},
        {"name": "email", "placeholder": "{{email}}"}
      ]
    };

    console.log("✅ Email template generated with anti-spam optimizations");
    return optimizedResult;

  } catch (error) {
    console.error("Error generating AI template:", error);
    
    // Provide a safe fallback template if AI fails
    return {
      subject: `Update for ${groupName} members`,
      content: generateFallbackTemplate(groupName, purpose, tone),
      variables: [
        {"name": "name", "placeholder": "{{name}}"},
        {"name": "email", "placeholder": "{{email}}"}
      ]
    };
  }
};

// Helper function to optimize subject lines for deliverability
const optimizeSubjectLine = (subject) => {
  // Remove common spam indicators
  let optimized = subject
    .replace(/FREE/gi, 'Complimentary')
    .replace(/URGENT/gi, 'Important')
    .replace(/ACT NOW/gi, 'Please review')
    .replace(/LIMITED TIME/gi, 'Available now')
    .replace(/WINNER/gi, 'Selected')
    .replace(/GUARANTEED/gi, 'Assured')
    .replace(/CONGRATULATIONS/gi, 'Good news')
    .replace(/CLICK HERE/gi, 'Learn more')
    .replace(/!!+/g, '!')
    .replace(/\?\?+/g, '?')
    .replace(/[A-Z]{3,}/g, (match) => 
      match.charAt(0) + match.slice(1).toLowerCase()
    );
  
  // Ensure reasonable length
  if (optimized.length > 50) {
    optimized = optimized.substring(0, 47) + '...';
  }
  
  return optimized.trim();
};

// Helper function to optimize email content for deliverability
const optimizeEmailContent = (content) => {
  // Ensure proper HTML structure with minimal inline styles
  if (!content.includes('<!DOCTYPE html>')) {
    content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    ${content}
</body>
</html>`;
  }
  
  // Ensure unsubscribe information is present
  if (!content.toLowerCase().includes('unsubscribe')) {
    content = content.replace(
      '</body>', 
      `
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="font-size: 12px; color: #666; text-align: center;">
      You're receiving this email because you're a member of our community. 
      <a href="#" style="color: #007bff; text-decoration: none;">Unsubscribe here</a> if you no longer wish to receive these emails.
    </p>
    <p style="font-size: 11px; color: #888; text-align: center;">
      Our Company Name, 123 Business Street, City, State 12345 | support@company.com
    </p>
</body>`
    );
  }
  
  return content;
};

// Fallback template generator for when AI fails
const generateFallbackTemplate = (groupName, purpose, tone) => {
  const toneClass = tone.toLowerCase().includes('formal') ? 'formal' : 'friendly';
  const greeting = toneClass === 'formal' ? 'Dear' : 'Hello';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin: 0 0 10px 0;">${greeting} {{name}},</h2>
    </div>
    
    <p>We hope this message finds you well. As a valued member of ${groupName}, we wanted to share some important information regarding ${purpose}.</p>
    
    <p>We believe this will be valuable to you and align with your interests as part of our community.</p>
    
    <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0;">
        <p style="margin: 0; font-style: italic;">Your participation and engagement mean a lot to us.</p>
    </div>
    
    <p>If you have any questions or would like to learn more, please don't hesitate to reach out to our team.</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Learn More</a>
    </div>
    
    <p>Best regards,<br>The Team</p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="font-size: 12px; color: #666; text-align: center;">
      You're receiving this email because you're a member of ${groupName}. 
      <a href="#" style="color: #007bff; text-decoration: none;">Unsubscribe here</a> if you no longer wish to receive these emails.
    </p>
    <p style="font-size: 11px; color: #888; text-align: center;">
      Our Company Name, 123 Business Street, City, State 12345 | support@company.com
    </p>
</body>
</html>`;
};