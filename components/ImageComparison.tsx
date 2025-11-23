
import React from 'react';

interface ImageComparisonProps {
  originals: string[];
  generated: string | null;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({ originals, generated }) => {
  if (originals.length === 0) return null;

  const isMultiInput = originals.length > 1;

  // Single Image Mode: Side-by-Side comparison
  if (!isMultiInput) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto mt-8">
        {/* Original Image Card */}
        <div className="group relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 bg-white border border-slate-100 transition-all duration-500 hover:shadow-3xl hover:-translate-y-1">
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-medium rounded-full border border-white/20">
              Original
            </span>
          </div>
          <div className="relative aspect-square md:aspect-[4/3] w-full bg-slate-50 flex items-center justify-center overflow-hidden">
              <img 
                src={originals[0]} 
                alt="Original" 
                className="object-contain w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
          </div>
        </div>

        {/* Generated Image Card (Right side) */}
        <div className="group relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-200/40 bg-white border border-blue-100 transition-all duration-500 hover:shadow-blue-300/50 hover:-translate-y-1">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Kalky AI
            </span>
          </div>
          
          {generated && (
              <div className="absolute top-4 right-4 z-10">
                   <a 
                    href={generated} 
                    download="kalky-ai-edit.png"
                    className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur hover:bg-white text-slate-800 rounded-full shadow-lg transition-all active:scale-95"
                    title="Download"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
              </div>
          )}

          <div className="relative aspect-square md:aspect-[4/3] w-full bg-slate-50 flex items-center justify-center overflow-hidden">
            {generated ? (
              <img 
                src={generated} 
                alt="Generated" 
                className="object-contain w-full h-full animate-fade-in"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-4 p-8 text-center w-full h-full bg-slate-50/50">
                <div className="w-20 h-20 rounded-full bg-white shadow-xl shadow-indigo-100 flex items-center justify-center animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-600 font-medium">AI Generation in progress...</p>
                  <p className="text-xs text-slate-400 mt-1">The masterpiece will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Multi Image Mode: Centered Result
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 flex flex-col items-center">
      {/* Generated Image Card (Centered) */}
      <div className="group relative w-full rounded-3xl overflow-hidden shadow-2xl shadow-blue-200/40 bg-white border border-blue-100 transition-all duration-500 hover:shadow-blue-300/50 hover:-translate-y-1">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Kalky AI Result
          </span>
        </div>
        
        {generated && (
            <div className="absolute top-4 right-4 z-10">
                 <a 
                  href={generated} 
                  download="kalky-ai-mix.png"
                  className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur hover:bg-white text-slate-800 rounded-full shadow-lg transition-all active:scale-95"
                  title="Download"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
            </div>
        )}

        <div className="relative aspect-video w-full bg-slate-50 flex items-center justify-center overflow-hidden">
          {generated ? (
            <img 
              src={generated} 
              alt="Generated" 
              className="object-contain w-full h-full animate-fade-in"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-4 p-8 text-center w-full h-full bg-slate-50/50">
              <div className="w-20 h-20 rounded-full bg-white shadow-xl shadow-indigo-100 flex items-center justify-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-600 font-medium">Mixing {originals.length} images...</p>
                <p className="text-xs text-slate-400 mt-1">The mixed result will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="w-full mt-4 flex items-center justify-center gap-2">
         <p className="text-xs text-slate-400 font-medium">Sources:</p>
         <div className="flex -space-x-2">
            {originals.map((src, i) => (
                <div key={i} className="w-8 h-8 rounded-full border border-white overflow-hidden shadow-sm">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};
