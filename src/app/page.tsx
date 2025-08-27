'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <div className="max-w-2xl text-center space-y-8">
        <p className="text-lg leading-relaxed text-gray-800">
          Welcome to this experimental AI chatbot designed to help you explore and prepare for personal challenges in a supportive way. Think of it as a digital sounding board that assists in mapping out your thoughts and feelings about real-life situations, like gearing up for a tough conversation. By interacting with the AI, you&apos;ll have a chance to reflect on your goals and build confidence step by step. Let&apos;s get started by describing your situation!
        </p>
        
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium cursor-pointer"
        >
          {isLoading ? 'Starting...' : 'Start'}
        </button>
      </div>
    </div>
  );
}