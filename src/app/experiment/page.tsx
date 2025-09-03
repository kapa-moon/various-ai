'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CHATBOT_CONDITIONS, getConditionByQuadrant } from '@/lib/chatbot-prompts';
import Image from 'next/image';

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
      
      // Navigate to chatbot page with condition
      const condition = getConditionByQuadrant(quadrant);
      if (condition) {
        router.push(`/chat?session=${sessionId}&condition=${condition.id}`);
      }
    } catch (error) {
      console.error('Error logging grid interaction:', error);
    }
  };

  if (!sessionId) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-12">
      <div className="max-w-4xl w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-4 text-center">Choose Your AI Companion</h1>
          <p className="text-gray-700 text-left">
            Each AI has a different approach to help you explore your situation. Select the one that feels right for your journey today.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Top Left - Inner Cheerleader (Blue) */}
          <button
            onClick={() => handleGridItemClick('top-left')}
            className="aspect-square bg-white border-2 border-blue-200 hover:border-blue-400 transition-colors p-8 flex items-center justify-center group cursor-pointer rounded-lg shadow-sm hover:shadow-md"
          >
            <div className="text-center">
              <div className="w-20 h-20 mb-4 mx-auto relative">
                <Image
                  src="/blue.png"
                  alt="Supportive Inner Voice"
                  width={80}
                  height={80}
                  className="rounded-full group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="font-medium text-lg mb-2 text-blue-800">Supportive Inner Voice</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Mirrors your style with agreeable, positive reinforcement to affirm your thoughts.
              </p>
            </div>
          </button>

          {/* Top Right - Tough Self-Critic (Green) */}
          <button
            onClick={() => handleGridItemClick('top-right')}
            className="aspect-square bg-white border-2 border-green-200 hover:border-green-400 transition-colors p-8 flex items-center justify-center group cursor-pointer rounded-lg shadow-sm hover:shadow-md"
          >
            <div className="text-center">
              <div className="w-20 h-20 mb-4 mx-auto relative">
                <Image
                  src="/green.png"
                  alt="Challenging Inner Voice"
                  width={80}
                  height={80}
                  className="rounded-full group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="font-medium text-lg mb-2 text-green-800">Challenging Inner Voice</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Mirrors your style with provocative, humorous counterpoints to expose assumptions.
              </p>
            </div>
          </button>

          {/* Bottom Left - Supportive Friend (Pink) */}
          <button
            onClick={() => handleGridItemClick('bottom-left')}
            className="aspect-square bg-white border-2 border-pink-200 hover:border-pink-400 transition-colors p-8 flex items-center justify-center group cursor-pointer rounded-lg shadow-sm hover:shadow-md"
          >
            <div className="text-center">
              <div className="w-20 h-20 mb-4 mx-auto relative">
                <Image
                  src="/pink.png"
                  alt="Supportive Companion"
                  width={80}
                  height={80}
                  className="rounded-full group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="font-medium text-lg mb-2 text-pink-800">Supportive Companion</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Engages agreeably in back-and-forth, offering validation and gentle encouragement.
              </p>
            </div>
          </button>

          {/* Bottom Right - Debate Partner (Yellow) */}
          <button
            onClick={() => handleGridItemClick('bottom-right')}
            className="aspect-square bg-white border-2 border-yellow-200 hover:border-yellow-400 transition-colors p-8 flex items-center justify-center group cursor-pointer rounded-lg shadow-sm hover:shadow-md"
          >
            <div className="text-center">
              <div className="w-20 h-20 mb-4 mx-auto relative">
                <Image
                  src="/yellow.png"
                  alt="Challenging Companion"
                  width={80}
                  height={80}
                  className="rounded-full group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="font-medium text-lg mb-2 text-yellow-800">Challenging Companion</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Engages provocatively in back-and-forth, using humor and counterarguments to build resilience.
              </p>
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
