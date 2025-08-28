'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function HomeContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const completed = searchParams.get('completed');
    if (completed) {
      setIsCompleted(true);
    }
  }, [searchParams]);

  const handleStart = async () => {
    setIsLoading(true);
    
    try {
      // Create a new session
      const response = await fetch('/api/sessions', {
        method: 'POST',
      });
      
      if (response.ok) {
        const { sessionId } = await response.json();
        // Navigate to the situation description page
        router.push(`/situation?session=${sessionId}`);
      } else {
        console.error('Failed to create session');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-8 py-12">
        <div className="max-w-2xl text-center space-y-6">
          <div className="bg-white border-2 border-black rounded-lg p-8">
            {/* <div className="text-6xl mb-4">✅</div> */}
            <h1 className="text-2xl font-medium text-black mb-4">✅  Thank You!</h1>
            <p className="text-lg text-gray-800 mb-4">
             You have successfully completed the experiment. Thank you for your participation!
            </p>
            <p className="text-gray-600">
              Your responses have been recorded. You may now close this window.
            </p>
          </div>
          
          <button
            onClick={() => {
              setIsCompleted(false);
              router.push('/');
            }}
            className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium cursor-pointer"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-12">
      <div className="max-w-2xl space-y-6">
        <p className="text-lg leading-relaxed text-gray-800 text-left">
          Welcome to this experimental AI chatbot designed to help you explore and prepare for personal challenges in a supportive way. Think of it as a digital sounding board that assists in mapping out your thoughts and feelings about real-life situations, like gearing up for a tough conversation. By interacting with the AI, you&apos;ll have a chance to reflect on your goals and build confidence step by step. Let&apos;s get started by describing your situation!
        </p>
        
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium cursor-pointer"
          >
            {isLoading ? 'Starting...' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}