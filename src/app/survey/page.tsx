'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const SURVEY_QUESTIONS = [
  {
    id: 'pre_item_1',
    question: 'How prepared do you feel right now to have this difficult conversation or to deal with this situation directly?',
    leftLabel: 'Not at all prepared',
    rightLabel: 'Extremely prepared'
  },
  {
    id: 'pre_item_2',
    question: 'How do you feel about yourself in this situation?',
    leftLabel: 'Very negative',
    rightLabel: 'Very positive'
  },
  {
    id: 'pre_item_3',
    question: 'How likely are you to have this conversation or work on the situation soon (e.g., within the next few days)?',
    leftLabel: 'Not at all likely',
    rightLabel: 'Extremely likely'
  }
];

function LikertScale({ 
  value, 
  onChange, 
  leftLabel, 
  rightLabel 
}: { 
  value: number | null; 
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">1 = {leftLabel}</span>
        <span className="text-sm text-gray-600">7 = {rightLabel}</span>
      </div>
      
      <div className="flex justify-between items-center">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <div key={num} className="flex flex-col items-center space-y-2">
            <button
              onClick={() => onChange(num)}
              className={`w-8 h-8 rounded-full border-2 transition-colors ${
                value === num
                  ? 'bg-black border-black text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {num}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SurveyContent() {
  const [responses, setResponses] = useState<Record<string, number>>({});
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

  const handleResponseChange = (questionId: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isComplete = SURVEY_QUESTIONS.every(q => responses[q.id] !== undefined);

  const handleNext = async () => {
    if (!isComplete || !sessionId) return;
    
    setIsLoading(true);
    
    try {
      // Submit survey responses
      const response = await fetch('/api/sessions/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          preItem1: responses.pre_item_1,
          preItem2: responses.pre_item_2,
          preItem3: responses.pre_item_3,
        }),
      });
      
      if (response.ok) {
        // Navigate to the experiment page
        router.push(`/experiment?session=${sessionId}`);
      } else {
        console.error('Failed to submit survey');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      setIsLoading(false);
    }
  };

  if (!sessionId) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <div className="max-w-3xl w-full space-y-12">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-6">Baseline Survey</h1>
          <p className="text-gray-700 leading-relaxed">
            Please answer the following questions about your current situation. Rate each item on a scale from 1 to 7.
          </p>
        </div>
        
        <div className="space-y-12">
          {SURVEY_QUESTIONS.map((question, index) => (
            <div key={question.id} className="space-y-6">
              <div className="text-lg font-medium">
                {index + 1}. {question.question}
              </div>
              
              <LikertScale
                value={responses[question.id] || null}
                onChange={(value) => handleResponseChange(question.id, value)}
                leftLabel={question.leftLabel}
                rightLabel={question.rightLabel}
              />
            </div>
          ))}
        </div>
        
        <div className="flex justify-center pt-8">
          <button
            onClick={handleNext}
            disabled={!isComplete || isLoading}
            className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium cursor-pointer"
          >
            {isLoading ? 'Submitting...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SurveyContent />
    </Suspense>
  );
}
