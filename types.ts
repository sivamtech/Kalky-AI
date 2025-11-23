export interface EditState {
  originalImage: string | null; // Base64 string
  generatedImage: string | null; // Base64 string
  prompt: string;
  isLoading: boolean;
  error: string | null;
}

export interface ImageDimension {
  width: number;
  height: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}