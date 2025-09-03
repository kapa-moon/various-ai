'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SituationContent() {
  const [situation, setSituation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const session = searchParams.get('session');
    if (!session) {
      router.push('/');
      return;
    }
    setSessionId(session);
  }, [searchParams, router]);

  const handleNext = async () => {
    if (!situation.trim() || !sessionId) return;
    
    setIsLoading(true);
    
    try {
      // Update session with situation description
      const response = await fetch('/api/sessions/situation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          situationDescription: situation.trim(),
        }),
      });
      
      if (response.ok) {
        // Navigate to the survey page
        router.push(`/survey?session=${sessionId}`);
      } else {
        console.error('Failed to update situation');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error updating situation:', error);
      setIsLoading(false);
    }
  };

  if (!sessionId) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-12">
      <div className="max-w-2xl w-full space-y-6">
        <div>
          <h1 className="text-2xl font-medium mb-6 text-center">Describe Your Situation</h1>
          <p className="text-gray-700 leading-relaxed mb-4 text-left">
            Please describe a somewhat difficult conversation or personal challenge you&apos;re facing or preparing for in 2-3 sentences. This will also help the AI tailor its support.
          </p>
          
          <div className="mb-8">
            <p className="text-gray-600 text-sm mb-2 font-medium">Hint:</p>
            <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
              <li>What is it? Who is involved?</li>
              <li>How does it make you feel right now?</li>
              <li>What mental state do you hope to reach (e.g., more confident, less anxious, or ready to act)?</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="Describe your situation here..."
            className="w-full h-40 p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            maxLength={1000}
          />
          
          <div className="text-right">
            <span className="text-sm text-gray-500">
              {situation.length}/1000 characters
            </span>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              disabled={!situation.trim() || isLoading}
              className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium cursor-pointer"
            >
              {isLoading ? 'Saving...' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SituationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SituationContent />
    </Suspense>
  );
}
