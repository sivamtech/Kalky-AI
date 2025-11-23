import { GoogleGenAI, Chat } from "@google/genai";

// Initialize the client with the environment variable API key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * edits an image using the Gemini 2.5 Flash Image model.
 * @param base64Image The source image in base64 format (including metadata prefix or raw)
 * @param prompt The text instruction for editing
 * @param mimeType The mime type of the input image
 * @returns The base64 string of the generated image
 */
export const editImageWithGemini = async (
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/png'
): Promise<string> => {
  try {
    // Clean the base64 string if it contains the data URL prefix
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Nano Banana
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        }
      ],
      // We rely on default config. 
      // Note: Setting responseMimeType is NOT supported for this model.
    });

    const candidate = response.candidates?.[0];

    // Check if the model blocked the response (e.g., Safety)
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      console.warn("Gemini finishReason:", candidate.finishReason);
      if (candidate.finishReason === 'SAFETY') {
        throw new Error("The request was blocked by safety filters. Please try a different prompt or image.");
      }
      throw new Error(`Generation stopped due to: ${candidate.finishReason}`);
    }

    const parts = candidate?.content?.parts;
    
    if (!parts || parts.length === 0) {
      throw new Error("No content returned from Gemini. The model might have refused the request.");
    }

    // Iterate through parts to find the image
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // Fallback if no image is found but text is returned (e.g., error explanation)
    const textPart = parts.find(p => p.text);
    if (textPart && textPart.text) {
      // Sometimes the model answers with text if it cannot perform the edit
      throw new Error(`Model returned text instead of image: "${textPart.text}"`);
    }

    throw new Error("No image data found in the response.");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

/**
 * Creates a new Chat session with specific system instructions for Kalky GPT.
 * Trained on Kalky Ecosystem data.
 */
export const createChatSession = (): Chat => {
  const knowledgeBase = `
    You are Kalky GPT, the exclusive AI concierge for the Kalky Group.
    
    Your core knowledge base and expertise covers the following Kalky Ecosystem entities:
    
    1. **Kalky Interior (www.kalkyinterior.com)**: 
       - Expertise: High-end Interior Design services.
       - Focus: Creating aesthetic and functional living spaces.

    2. **Kitzine (www.kitzine.com)**:
       - Expertise: Premium Modular Kitchens, Wardrobes, Custom Furniture, Lighting solutions, and Electrical usage planning.
       - Focus: Modern utility and luxury for home interiors.

    3. **Kalky Digital (www.kalkydigital.com)**:
       - Expertise: Comprehensive Software Solutions.
       - Services: Website Development, Mobile App Development, and Digital Marketing strategies.

    4. **Kalky Infra (www.kalky.in)**:
       - Expertise: Construction and Real Estate.
       - Services: Home Construction, Office setup, Kitchen Interior execution, and Commercial Space development.
       - This is the core business.

    Your Persona:
    - Tone: Professional, sophisticated, polite, and helpful (like a high-end Mac/Apple concierge).
    - You represent the brand "Kalky Digital".
    - When asked about services, strictly refer to the relevant Kalky entity above.
    - Be concise but informative.
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: knowledgeBase,
    },
  });
};
