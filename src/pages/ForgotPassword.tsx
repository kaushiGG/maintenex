import React from 'react';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-black p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-[60%] h-[60%] bg-forgemate-orange/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-forgemate-gradient-start/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-[5%] -right-[15%] w-[30%] h-[30%] bg-forgemate-gradient-end/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="forgemate-card w-full max-w-md p-8 relative z-10 opacity-0 animate-fadeIn">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPassword;
