import React, { useEffect } from 'react';
import RegisterForm from '@/components/RegisterForm';
import ForgematePattern from '@/components/ForgematePattern';

const Index = () => {
  // Add subtle background animation on component mount
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      document.documentElement.style.setProperty('--mouse-x', x.toString());
      document.documentElement.style.setProperty('--mouse-y', y.toString());
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-black p-0 overflow-hidden">
      {/* Left side with Forgemate Pattern */}
      <div className="w-1/2 hidden md:block relative overflow-hidden">
        <ForgematePattern className="animate-fadeIn" />
        </div>
        
      {/* Right side with form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 relative">
        {/* Background elements */}
        <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-[60%] h-[60%] bg-forgemate-orange/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-forgemate-gradient-start/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-[5%] -right-[15%] w-[30%] h-[30%] bg-forgemate-gradient-end/15 rounded-full blur-3xl"></div>
        </div>
        
        <div className="forgemate-card w-full max-w-md p-8 relative z-10 opacity-0 animate-fadeIn">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
