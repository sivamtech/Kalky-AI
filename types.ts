
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

export interface EditState {
  originalImages: string[]; // Array of Base64 strings
  generatedImage: string | null; // Base64 string
  prompt: string;
  aspectRatio: AspectRatio;
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
