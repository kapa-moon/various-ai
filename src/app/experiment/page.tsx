'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ExperimentContent() {
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

  const handleGridItemClick = async (quadrant: string) => {
    if (!sessionId) return;
    
    try {
      // Log the grid interaction
      await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          interactionType: 'grid_selection',
          data: { quadrant, timestamp: new Date().toISOString() },
        }),
      });
      
      // You can add navigation logic here based on the quadrant
      console.log(`Selected quadrant: ${quadrant}`);
    } catch (error) {
      console.error('Error logging grid interaction:', error);
    }
  };

  if (!sessionId) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-medium mb-4">Choose Your Path</h1>
          <p className="text-gray-700">
            Select one of the four approaches below to continue your session.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Top Left - Quadrant 1 */}
          <button
            onClick={() => handleGridItemClick('top-left')}
            className="aspect-square bg-white border-2 border-gray-300 hover:border-black transition-colors p-8 flex items-center justify-center group cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 mx-auto group-hover:bg-gray-200 transition-colors"></div>
              <h3 className="font-medium text-lg mb-2">Option 1</h3>
              <p className="text-gray-600 text-sm">Coming soon...</p>
            </div>
          </button>

          {/* Top Right - Quadrant 2 */}
          <button
            onClick={() => handleGridItemClick('top-right')}
            className="aspect-square bg-white border-2 border-gray-300 hover:border-black transition-colors p-8 flex items-center justify-center group cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 mx-auto group-hover:bg-gray-200 transition-colors"></div>
              <h3 className="font-medium text-lg mb-2">Option 2</h3>
              <p className="text-gray-600 text-sm">Coming soon...</p>
            </div>
          </button>

          {/* Bottom Left - Quadrant 3 */}
          <button
            onClick={() => handleGridItemClick('bottom-left')}
            className="aspect-square bg-white border-2 border-gray-300 hover:border-black transition-colors p-8 flex items-center justify-center group cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 mx-auto group-hover:bg-gray-200 transition-colors"></div>
              <h3 className="font-medium text-lg mb-2">Option 3</h3>
              <p className="text-gray-600 text-sm">Coming soon...</p>
            </div>
          </button>

          {/* Bottom Right - Quadrant 4 */}
          <button
            onClick={() => handleGridItemClick('bottom-right')}
            className="aspect-square bg-white border-2 border-gray-300 hover:border-black transition-colors p-8 flex items-center justify-center group cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 mx-auto group-hover:bg-gray-200 transition-colors"></div>
              <h3 className="font-medium text-lg mb-2">Option 4</h3>
              <p className="text-gray-600 text-sm">Coming soon...</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExperimentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ExperimentContent />
    </Suspense>
  );
}
