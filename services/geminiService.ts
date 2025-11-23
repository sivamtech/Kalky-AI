
import { GoogleGenAI, Chat } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates or edits an image using the Gemini 2.5 Flash Image model with multiple inputs.
 * @param base64Images Array of source images in base64 format
 * @param prompt The text instruction
 * @param aspectRatio The desired output aspect ratio
 * @returns The base64 string of the generated image
 */
export const editImageWithGemini = async (
  base64Images: string[],
  prompt: string,
  aspectRatio: string = '1:1',
): Promise<string> => {
  try {
    const parts: any[] = [
      {
        text: `Perform the following image generation/edit: "${prompt}".\n\nIMPORTANT: You must ONLY return the edited/generated image. Do not provide any text explanation. If the request is to mix images, blend their concepts.`, 
      }
    ];

    // Add all images to the payload
    for (const base64Image of base64Images) {
        const match = base64Image.match(/^data:(image\/\w+);base64,/);
        const mimeType = match ? match[1] : 'image/png';
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

        parts.push({
            inlineData: {
                data: base64Data,
                mimeType: mimeType,
            },
        });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Nano Banana
      contents: [
        {
          parts: parts,
        }
      ],
      config: {
        imageConfig: {
            aspectRatio: aspectRatio
        }
      }
    });

    const candidate = response.candidates?.[0];

    // Check if the model blocked the response (e.g., Safety)
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      console.warn("Gemini finishReason:", candidate.finishReason);
      if (candidate.finishReason === 'SAFETY') {
        throw new Error("Safety Block: The model refused to generate the image based on safety guidelines. Please try a different prompt.");
      }
      if (candidate.finishReason === 'RECITATION') {
        throw new Error("Recitation Block: The model flagged this content as a recitation of copyrighted material.");
      }
      throw new Error(`Generation stopped due to: ${candidate.finishReason}`);
    }

    const responseParts = candidate?.content?.parts;
    
    if (!responseParts || responseParts.length === 0) {
      // If we have no parts but no error finishReason, it's an unexpected API state
      throw new Error("No content returned from Gemini. Please try again with a different image or prompt.");
    }

    // Iterate through parts to find the image
    for (const part of responseParts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // Fallback if no image is found but text is returned (e.g., error explanation)
    const textPart = responseParts.find(p => p.text);
    if (textPart && textPart.text) {
      // Sometimes the model answers with text if it cannot perform the edit
      console.log("Model Text Response:", textPart.text);
      throw new Error(`The model responded with text instead of an image: "${textPart.text.substring(0, 100)}..."`);
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
