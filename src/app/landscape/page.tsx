'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Metaphor {
  emotion: string;
  geography: string;
  phrase: string;
}

function LandscapeContent() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [situationDescription, setSituationDescription] = useState<string>('');
  const [startMetaphor, setStartMetaphor] = useState<Metaphor | null>(null);
  const [endMetaphor, setEndMetaphor] = useState<Metaphor | null>(null);
  const [editedStartPhrase, setEditedStartPhrase] = useState<string>('');
  const [editedEndPhrase, setEditedEndPhrase] = useState<string>('');
  const [isEditingStart, setIsEditingStart] = useState(false);
  const [isEditingEnd, setIsEditingEnd] = useState(false);
  const [journeyProgress, setJourneyProgress] = useState<number>(4); // 1-7 scale, start at middle
  const [willingnessToContinue, setWillingnessToContinue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const session = searchParams.get('session');
    if (!session) {
      router.push('/');
      return;
    }
    setSessionId(session);
    fetchSituationAndGenerateMetaphors(session);
  }, [searchParams, router]);

  const fetchSituationAndGenerateMetaphors = async (sessionId: string) => {
    try {
      // Fetch situation description
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        const situation = data.situation_description || data.situationDescription || '';
        setSituationDescription(situation);
        
        // Generate metaphors based on situation
        await generateMetaphors(situation);
      }
    } catch (error) {
      console.error('Error fetching situation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMetaphors = async (situation: string) => {
    try {
      console.log('Generating metaphors for situation:', situation);
      
      const response = await fetch('/api/generate-metaphors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ situation }),
      });

      if (response.ok) {
        const { startMetaphor, endMetaphor } = await response.json();
        console.log('Generated metaphors:', { startMetaphor, endMetaphor });
        setStartMetaphor(startMetaphor);
        setEndMetaphor(endMetaphor);
      } else {
        const errorData = await response.json();
        console.error('API error generating metaphors:', errorData);
        
        // Use fallback metaphors if provided in the error response
        if (errorData.fallback && errorData.fallback.startMetaphor && errorData.fallback.endMetaphor) {
          console.log('Using fallback metaphors from API');
          setStartMetaphor(errorData.fallback.startMetaphor);
          setEndMetaphor(errorData.fallback.endMetaphor);
        } else {
          // Use local fallback
          throw new Error(errorData.error || 'Failed to generate metaphors');
        }
      }
    } catch (error) {
      console.error('Error generating metaphors:', error);
      // Fallback metaphors
      setStartMetaphor({ emotion: 'uncertain', geography: 'valley', phrase: 'uncertain valley' });
      setEndMetaphor({ emotion: 'confident', geography: 'peak', phrase: 'confident peak' });
    }
  };

  const handleStartEdit = () => {
    setEditedStartPhrase(startMetaphor?.phrase || '');
    setIsEditingStart(true);
  };

  const handleEndEdit = () => {
    setEditedEndPhrase(endMetaphor?.phrase || '');
    setIsEditingEnd(true);
  };

  const saveStartEdit = () => {
    setIsEditingStart(false);
  };

  const saveEndEdit = () => {
    setIsEditingEnd(false);
  };

  const handleContinue = async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    
    try {
      // Save landscape assessment data
      await fetch('/api/sessions/landscape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          generatedStartPhrase: startMetaphor?.phrase || '',
          generatedEndPhrase: endMetaphor?.phrase || '',
          editedStartPhrase: isEditingStart || editedStartPhrase ? editedStartPhrase : null,
          editedEndPhrase: isEditingEnd || editedEndPhrase ? editedEndPhrase : null,
          journeyProgress,
          willingnessToContinue: journeyProgress >= 7 ? null : willingnessToContinue,
        }),
      });

      // Navigate to post-survey
      router.push(`/survey?session=${sessionId}&post=true`);
    } catch (error) {
      console.error('Error saving landscape data:', error);
      setIsLoading(false);
    }
  };

  // Calculate pointer position on the landscape (0-100%)
  const getPointerPosition = () => {
    return ((journeyProgress - 1) / 6) * 100; // Convert 1-7 to 0-100%
  };

  const isComplete = journeyProgress >= 7 || willingnessToContinue !== null;

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Creating your emotional landscape...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-4 text-center">Your Emotional Journey</h1>
          <p className="text-gray-700 text-left">
            Explore your emotional landscape and mark where you are on your journey.
          </p>
        </div>

        {/* Landscape SVG */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="relative">
            <svg
              viewBox="0 0 800 300"
              className="w-full h-64 border border-gray-200 rounded-lg"
              style={{ background: 'linear-gradient(to bottom, #e0f2fe 0%, #f0f9ff 100%)' }}
            >
              {/* Starting point (left side - valley) */}
              <path
                d="M 50 250 Q 100 280 150 250 Q 200 220 250 250"
                fill="none"
                stroke="#64748b"
                strokeWidth="3"
                opacity="0.6"
              />
              
              {/* Journey path */}
              <path
                d="M 250 250 Q 350 200 450 180 Q 550 160 650 120 Q 700 100 750 80"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeDasharray="5,5"
                opacity="0.8"
              />
              
              {/* End point (right side - peak) */}
              <path
                d="M 650 120 L 700 50 L 750 80 L 720 120 Z"
                fill="#10b981"
                opacity="0.3"
              />
              
              {/* Trees and landscape elements */}
              <circle cx="100" cy="240" r="8" fill="#22c55e" opacity="0.4" />
              <circle cx="120" cy="235" r="6" fill="#22c55e" opacity="0.4" />
              <circle cx="680" cy="130" r="10" fill="#22c55e" opacity="0.6" />
              <circle cx="720" cy="125" r="8" fill="#22c55e" opacity="0.6" />
              
              {/* Journey pointer */}
              <circle
                cx={50 + (getPointerPosition() / 100) * 700}
                cy={250 - (getPointerPosition() / 100) * 170}
                r="8"
                fill="#dc2626"
                stroke="white"
                strokeWidth="2"
                className="drop-shadow-lg"
              />
            </svg>
          </div>
        </div>

        {/* Metaphor phrases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Starting point */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-3">Starting Point</h3>
            {isEditingStart ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editedStartPhrase}
                  onChange={(e) => setEditedStartPhrase(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveStartEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingStart(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-lg italic text-blue-800">
                  &ldquo;{editedStartPhrase || startMetaphor?.phrase}&rdquo;
                </span>
                <button
                  onClick={handleStartEdit}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* End point */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-medium text-green-900 mb-3">Desired Destination</h3>
            {isEditingEnd ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editedEndPhrase}
                  onChange={(e) => setEditedEndPhrase(e.target.value)}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEndEdit}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingEnd(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-lg italic text-green-800">
                  &ldquo;{editedEndPhrase || endMetaphor?.phrase}&rdquo;
                </span>
                <button
                  onClick={handleEndEdit}
                  className="text-green-600 hover:text-green-800 text-sm underline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Journey progress slider */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="font-medium mb-4">Where are you on this journey right now?</h3>
          <div className="space-y-4">
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={journeyProgress}
              onChange={(e) => setJourneyProgress(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((journeyProgress - 1) / 6) * 100}%, #e5e7eb ${((journeyProgress - 1) / 6) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Just started</span>
              <span>Halfway there</span>
              <span>Reached destination</span>
            </div>
            <div className="text-center">
              <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border border-gray-300">
                Position: {journeyProgress}/7
              </span>
            </div>
          </div>
        </div>

        {/* Willingness to continue question (only if not at end) */}
        {journeyProgress < 7 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="font-medium mb-4">
              How willing are you to continue on this emotional mapping journey?
            </h3>
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={willingnessToContinue || 4}
                onChange={(e) => setWillingnessToContinue(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Not willing at all</span>
                <span>Somewhat willing</span>
                <span>Very willing</span>
              </div>
              {willingnessToContinue && (
                <div className="text-center">
                  <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border border-gray-300">
                    Willingness: {willingnessToContinue}/7
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Continue button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!isComplete || isLoading}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Saving...' : 'Continue to Survey'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LandscapePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <LandscapeContent />
    </Suspense>
  );
}
