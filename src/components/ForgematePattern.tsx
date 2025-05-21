import React from 'react';
import { cn } from '@/lib/utils';

interface ForgematePatternProps {
  className?: string;
}

const ForgematePattern: React.FC<ForgematePatternProps> = ({ className }) => {
  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-[10%] left-[10%] w-[50%] h-[50%] bg-forgemate-orange/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-forgemate-orange/10 rounded-full blur-3xl animation-delay-300" />
      </div>
      
      <div className="grid grid-cols-5 gap-4 sm:gap-5 md:gap-6 max-w-sm sm:max-w-md opacity-0 animate-fadeIn animation-delay-200">
        {/* Row 1 */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-100"></div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-200"></div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-300"></div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-400"></div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-500"></div>
        
        {/* Row 2 */}
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-200"></div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-300"></div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-400"></div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-500"></div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-100"></div>
        
        {/* Row 3 */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-300"></div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-400"></div>
        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-500"></div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-100"></div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-200"></div>
        
        {/* Row 4 */}
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-400"></div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-500"></div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-100"></div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-200"></div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-300"></div>
        
        {/* Row 5 */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-500"></div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-100"></div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-200"></div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-300"></div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end rounded-full animate-pulse animation-delay-400"></div>
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 opacity-0 animate-fadeIn animation-delay-500">
        <h1 className="text-5xl font-black tracking-widest text-white animate-float">FORGEMATE</h1>
        <p className="mt-4 text-lg max-w-xs text-center text-white/80">
          Streamline your maintenance operations with our comprehensive desktop solution.
        </p>
      </div>
    </div>
  );
};

export default ForgematePattern; 