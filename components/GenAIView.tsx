
import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { ImageComparison } from './ImageComparison';
import { editImageWithGemini } from '../services/geminiService';
import { EditState, AspectRatio } from '../types';

export const GenAIView: React.FC = () => {
  const [state, setState] = useState<EditState>({
    originalImages: [],
    generatedImage: null,
    prompt: '',
    aspectRatio: '1:1',
    isLoading: false,
    error: null,
  });
  
  const [refinePrompt, setRefinePrompt] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    
    const newImages: string[] = [];
    const maxFiles = 10;
    const currentCount = state.originalImages.length;
    const filesToProcess = Array.from(files).slice(0, maxFiles - currentCount);

    if (filesToProcess.length === 0 && files.length > 0) {
        setState(prev => ({ ...prev, error: `You can only upload up to ${maxFiles} images.` }));
        return;
    }

    let processedCount = 0;

    filesToProcess.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
             setState(prev => ({ ...prev, error: "One or more files exceed the 5MB limit." }));
             return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
            newImages.push(reader.result as string);
            processedCount++;
            
            // Once all files in this batch are processed, update state
            if (processedCount === filesToProcess.length) {
                 setState(prev => ({
                    ...prev,
                    originalImages: [...prev.originalImages, ...newImages],
                    generatedImage: null, // Reset result on new upload
                    error: null
                 }));
            }
        };
        reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
    // Reset input so same files can be selected again if needed
    if (event.target) event.target.value = '';
  };

  const removeImage = (index: number) => {
    setState(prev => ({
        ...prev,
        originalImages: prev.originalImages.filter((_, i) => i !== index),
        generatedImage: null
    }));
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, prompt: e.target.value }));
  };

  const handleRefinePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefinePrompt(e.target.value);
  };

  const handleAspectRatioChange = (ratio: AspectRatio) => {
    setState(prev => ({ ...prev, aspectRatio: ratio }));
  };

  const handleReset = () => {
    setState({
      originalImages: [],
      generatedImage: null,
      prompt: '',
      aspectRatio: '1:1',
      isLoading: false,
      error: null,
    });
    setRefinePrompt('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (addMoreInputRef.current) addMoreInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (state.originalImages.length === 0 || !state.prompt.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const generatedImage = await editImageWithGemini(
        state.originalImages, 
        state.prompt, 
        state.aspectRatio
      );
      
      setState(prev => ({
        ...prev,
        generatedImage,
        isLoading: false,
      }));
    } catch (err: any) {
      let errorMessage = "Generation failed. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
        if (errorMessage.includes("400")) errorMessage = "The request is invalid. Try a simpler prompt.";
        if (errorMessage.includes("403")) errorMessage = "Access denied. Please check your system configuration.";
        if (errorMessage.includes("SAFETY")) errorMessage = "The request was blocked by safety filters. Please adjust your prompt.";
      }
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleRefine = async () => {
    if (!state.generatedImage || !refinePrompt.trim()) return;

    // Use the current result as the source for the next edit
    const sourceImage = state.generatedImage;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Pass the generated image as a single element array for refinement
      const newGeneratedImage = await editImageWithGemini(
        [sourceImage], 
        refinePrompt, 
        state.aspectRatio
      );
      
      setState(prev => ({
        ...prev,
        originalImages: [sourceImage], // Move result to original context
        generatedImage: newGeneratedImage, // New result
        prompt: '', // Clear main prompt
        isLoading: false,
      }));
      setRefinePrompt('');
    } catch (err: any) {
      let errorMessage = "Refinement failed. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
        if (errorMessage.includes("SAFETY")) errorMessage = "The request was blocked by safety filters. Please adjust your prompt.";
      }
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      action();
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in relative z-10 pb-20">
        {/* Intro / Hero Section */}
        {state.originalImages.length === 0 && (
          <div className="text-center mt-8 mb-16 max-w-3xl animate-float">
            <h1 className="text-4xl md:text-6xl font-semibold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[#000044] via-blue-700 to-indigo-500 pb-2">
              Reality, Reimagined.
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-light leading-relaxed">
              Upload up to 10 images to mix, blend, or edit them with <br className="hidden md:block"/>
              <span className="font-semibold text-blue-600">Kalky GEN AI</span>.
            </p>
          </div>
        )}

        {/* Upload Drop Zone - Initial State */}
        {state.originalImages.length === 0 && (
          <div className="w-full max-w-2xl relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <label className="relative flex flex-col items-center justify-center w-full h-80 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-xl transition-all duration-300 group-hover:scale-[1.005] group-hover:bg-white/90">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50 flex items-center justify-center mb-6 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#000044]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="mb-3 text-2xl font-medium text-slate-800">Drop your images here</p>
                <p className="text-slate-400">Support for PNG & JPG (Max 10 files)</p>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        {/* Workspace */}
        {state.originalImages.length > 0 && (
          <div className="w-full flex flex-col items-center">
            
            {/* Image Preview Stack */}
            <div className="w-full max-w-4xl mb-8">
                <div className="flex items-center gap-4 overflow-x-auto pb-4 px-2 snap-x no-scrollbar">
                    {state.originalImages.map((img, idx) => (
                        <div key={idx} className="relative group shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-white shadow-lg snap-center bg-white">
                            <img src={img} alt={`Source ${idx}`} className="w-full h-full object-cover" />
                            <button 
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-red-500/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    
                    {state.originalImages.length < 10 && (
                        <label className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white/30 flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs text-slate-500 mt-1 font-medium">Add Image</span>
                            <input 
                                ref={addMoreInputRef}
                                type="file" 
                                multiple
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </label>
                    )}
                </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className={`w-full max-w-lg mb-4 flex justify-center transition-opacity duration-300 ${state.isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="bg-white/80 backdrop-blur-md rounded-full p-1 shadow-lg shadow-blue-900/5 border border-white/60 flex items-center">
                 {[
                   { id: '16:9', label: 'Landscape', icon: 'M4 6h16v12H4z' },
                   { id: '9:16', label: 'Portrait', icon: 'M7 4h10v16H7z' },
                   { id: '1:1', label: 'Square', icon: 'M4 4h16v16H4z' }
                 ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleAspectRatioChange(opt.id as AspectRatio)}
                      className={`
                        relative px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all duration-300
                        ${state.aspectRatio === opt.id 
                          ? 'bg-[#000044] text-white shadow-md' 
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}
                      `}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                        <path d={opt.icon} />
                      </svg>
                      {opt.label}
                    </button>
                 ))}
              </div>
            </div>

            {/* Action Bar / Input - Floating Mac Bar */}
            <div className="w-full max-w-3xl mb-8 sticky top-24 z-40">
              <div className={`glass-panel p-2 rounded-full shadow-2xl shadow-blue-900/10 flex items-center gap-2 pr-2 pl-6 transition-all ring-1 ring-white/50 hover:ring-blue-200/50 ${state.isLoading ? 'opacity-80 pointer-events-none' : ''}`}>
                <div className="text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <input
                    type="text"
                    className="flex-grow bg-transparent border-none text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none text-lg py-3"
                    placeholder="Describe how to mix or edit these images..."
                    value={state.prompt}
                    onChange={handlePromptChange}
                    onKeyDown={(e) => handleKeyDown(e, handleGenerate)}
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
                    Start Over
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
              originals={state.originalImages}
              generated={state.generatedImage}
            />

            {/* Refine / Continue Editing Section */}
            {state.generatedImage && !state.isLoading && (
              <div className="w-full max-w-2xl mt-12 animate-fade-in-up">
                 <div className="text-center mb-3">
                    <p className="text-sm text-slate-500 font-medium">Not quite right? Refine the result.</p>
                 </div>
                 <div className="glass-panel p-1.5 rounded-full shadow-xl shadow-indigo-100 flex items-center gap-2 pr-1.5 pl-5 ring-1 ring-white/60">
                    <div className="text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="flex-grow bg-transparent border-none text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none text-base py-2"
                        placeholder="Make changes to the result..."
                        value={refinePrompt}
                        onChange={handleRefinePromptChange}
                        onKeyDown={(e) => handleKeyDown(e, handleRefine)}
                    />
                    <Button 
                        variant="secondary" 
                        onClick={handleRefine}
                        disabled={!refinePrompt.trim()}
                        className="h-9 px-5 text-sm whitespace-nowrap !bg-indigo-50 !text-indigo-700 hover:!bg-indigo-100 border-none"
                    >
                        Refine
                    </Button>
                 </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
};
