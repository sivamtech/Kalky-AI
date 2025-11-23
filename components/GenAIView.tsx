import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { ImageComparison } from './ImageComparison';
import { editImageWithGemini } from '../services/geminiService';
import { EditState } from '../types';

export const GenAIView: React.FC = () => {
  const [state, setState] = useState<EditState>({
    originalImage: null,
    generatedImage: null,
    prompt: '',
    isLoading: false,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setState(prev => ({ ...prev, error: "File size exceeds 5MB limit." }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setState({
          originalImage: reader.result as string,
          generatedImage: null,
          prompt: '',
          isLoading: false,
          error: null,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, prompt: e.target.value }));
  };

  const handleReset = () => {
    setState({
      originalImage: null,
      generatedImage: null,
      prompt: '',
      isLoading: false,
      error: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!state.originalImage || !state.prompt.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const match = state.originalImage.match(/^data:(image\/\w+);base64,/);
      const mimeType = match ? match[1] : 'image/png';

      const generatedImage = await editImageWithGemini(state.originalImage, state.prompt, mimeType);
      
      setState(prev => ({
        ...prev,
        generatedImage,
        isLoading: false,
      }));
    } catch (err: any) {
      let errorMessage = "Generation failed. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
        if (errorMessage.includes("400")) errorMessage = "Invalid request. Please check your image.";
        if (errorMessage.includes("403")) errorMessage = "Access denied. Please check API Key.";
        if (errorMessage.includes("SAFETY")) errorMessage = "Request blocked by safety filters.";
      }
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleGenerate();
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in relative z-10">
        {/* Intro / Hero Section */}
        {!state.originalImage && (
          <div className="text-center mt-8 mb-16 max-w-3xl animate-float">
            <h1 className="text-4xl md:text-6xl font-semibold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[#000044] via-blue-700 to-indigo-500 pb-2">
              Reality, Reimagined.
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-light leading-relaxed">
              Upload an image and use natural language to transform it. <br className="hidden md:block"/>
              Powered by <span className="font-semibold text-blue-600">Kalky GEN AI</span>.
            </p>
          </div>
        )}

        {/* Upload Drop Zone - Mac Style */}
        {!state.originalImage && (
          <div className="w-full max-w-2xl relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <label className="relative flex flex-col items-center justify-center w-full h-80 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-xl transition-all duration-300 group-hover:scale-[1.005] group-hover:bg-white/90">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50 flex items-center justify-center mb-6 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#000044]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="mb-3 text-2xl font-medium text-slate-800">Drop your image here</p>
                <p className="text-slate-400">Support for PNG & JPG</p>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        {/* Workspace */}
        {state.originalImage && (
          <div className="w-full flex flex-col items-center">
            
            {/* Action Bar / Input - Floating Mac Bar */}
            <div className="w-full max-w-3xl mb-8 sticky top-28 z-40">
              <div className={`glass-panel p-2 rounded-full shadow-2xl shadow-blue-900/10 flex items-center gap-2 pr-2 pl-6 transition-all ring-1 ring-white/50 hover:ring-blue-200/50 ${state.isLoading ? 'opacity-80 pointer-events-none' : ''}`}>
                <div className="text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <input
                    type="text"
                    className="flex-grow bg-transparent border-none text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none text-lg py-3"
                    placeholder="Describe how to edit this image..."
                    value={state.prompt}
                    onChange={handlePromptChange}
                    onKeyDown={handleKeyDown}
                    disabled={state.isLoading}
                    autoFocus
                />
                <Button 
                    variant="primary" 
                    onClick={handleGenerate}
                    isLoading={state.isLoading}
                    disabled={!state.prompt.trim()}
                    className="h-10 px-6 text-sm whitespace-nowrap"
                >
                    Generate
                </Button>
              </div>
            </div>

            {/* Controls for Reset */}
            <div className="w-full max-w-6xl flex justify-end px-4 -mt-4 mb-4">
                <button 
                    onClick={handleReset}
                    className="text-sm text-slate-500 hover:text-[#000044] transition-colors flex items-center gap-1 font-medium bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20 shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    New Image
                </button>
            </div>

            {/* Error Toast */}
            {state.error && (
              <div className="mb-6 px-6 py-4 bg-red-50/90 backdrop-blur text-red-700 border border-red-200 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in-up max-w-2xl">
                <div className="bg-red-100 p-1.5 rounded-full shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                   <p className="font-medium text-sm">Action Failed</p>
                   <p className="text-sm opacity-90">{state.error}</p>
                </div>
              </div>
            )}

            {/* Visuals */}
            <ImageComparison 
              original={state.originalImage}
              generated={state.generatedImage}
            />
          </div>
        )}
    </div>
  );
};
