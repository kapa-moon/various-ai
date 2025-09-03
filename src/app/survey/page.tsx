'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PRE_SURVEY_QUESTIONS = [
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

const PANAS_ITEMS = [
  { id: 'active', label: 'Active' },
  { id: 'alert', label: 'Alert' },
  { id: 'attentive', label: 'Attentive' },
  { id: 'determined', label: 'Determined' },
  { id: 'inspired', label: 'Inspired' },
  { id: 'afraid', label: 'Afraid' },
  { id: 'ashamed', label: 'Ashamed' },
  { id: 'hostile', label: 'Hostile' },
  { id: 'nervous', label: 'Nervous' },
  { id: 'upset', label: 'Upset' }
];

const POST_SURVEY_QUESTIONS = [
  {
    id: 'post_item_1',
    question: 'How prepared do you feel now to have this difficult conversation or to deal with this situation directly?',
    leftLabel: 'Not at all prepared',
    rightLabel: 'Extremely prepared'
  },
  {
    id: 'post_item_2',
    question: 'How do you feel about yourself in this situation now?',
    leftLabel: 'Very negative',
    rightLabel: 'Very positive'
  },
  {
    id: 'post_item_3',
    question: 'How likely are you now to have this conversation or work on the situation soon (e.g., within the next few days)?',
    leftLabel: 'Not at all likely',
    rightLabel: 'Extremely likely'
  },
  {
    id: 'post_item_4',
    question: 'How useful was the AI in helping you prepare for your situation?',
    leftLabel: 'Not at all useful',
    rightLabel: 'Extremely useful'
  },
  {
    id: 'post_item_5',
    question: 'To what extent did you feel in control of the conversation?',
    leftLabel: 'Not at all in control',
    rightLabel: 'Completely in control'
  },
  {
    id: 'post_item_6',
    question: 'Would you use this AI again for similar challenges?',
    leftLabel: 'Definitely not',
    rightLabel: 'Definitely yes'
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

function PANASScale({ 
  value, 
  onChange, 
  label 
}: { 
  value: number | null; 
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="font-medium text-gray-700 w-24">{label}</span>
      
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`w-8 h-8 rounded-full border-2 transition-colors ${
              value === num
                ? 'bg-black border-black text-white'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

function SurveyContent() {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [panasResponses, setPanasResponses] = useState<Record<string, number>>({});
  const [openResponse, setOpenResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isPostSurvey, setIsPostSurvey] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const session = searchParams.get('session');
    const post = searchParams.get('post');
    if (!session) {
      router.push('/');
      return;
    }
    setSessionId(session);
    setIsPostSurvey(post === 'true');
  }, [searchParams, router]);

  const handleResponseChange = (questionId: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handlePanasResponseChange = (itemId: string, value: number) => {
    setPanasResponses(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const currentQuestions = isPostSurvey ? POST_SURVEY_QUESTIONS : PRE_SURVEY_QUESTIONS;
  const likertComplete = currentQuestions.every(q => responses[q.id] !== undefined);
  const panasComplete = PANAS_ITEMS.every(item => panasResponses[item.id] !== undefined);
  const openResponseComplete = !isPostSurvey || openResponse.length >= 20;
  const isComplete = likertComplete && panasComplete && openResponseComplete;
  


  const handleNext = async () => {
    if (!isComplete || !sessionId) return;
    
    setIsLoading(true);
    
    try {
      if (isPostSurvey) {
        // Submit post-survey responses
        const requestData = {
          sessionId,
          postItem1: responses.post_item_1,
          postItem2: responses.post_item_2,
          postItem3: responses.post_item_3,
          postItem4: responses.post_item_4,
          postItem5: responses.post_item_5,
          postItem6: responses.post_item_6,
          openResponse: openResponse.trim(),
          panasData: panasResponses,
        };
        
        console.log('Submitting post-survey data:', requestData);
        
        const response = await fetch('/api/sessions/post-survey', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
        
        if (response.ok) {
          // Show completion page or redirect to thank you page
          router.push(`/?completed=${sessionId}`);
        } else {
          const errorData = await response.json();
          console.error('Failed to submit post-survey:', errorData);
          alert(`Failed to submit survey: ${errorData.error || 'Unknown error'}`);
          setIsLoading(false);
        }
      } else {
        // Submit pre-survey responses
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
            panasData: panasResponses,
          }),
        });
        
        if (response.ok) {
          // Navigate to the pre-landscape page
          router.push(`/pre-landscape?session=${sessionId}`);
        } else {
          console.error('Failed to submit survey');
          setIsLoading(false);
        }
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
    <div className="min-h-screen flex items-center justify-center px-8 py-12">
      <div className="max-w-3xl w-full space-y-8">
        <div>
          <h1 className="text-2xl font-medium mb-6 text-center">
            {isPostSurvey ? 'Follow-up Survey' : 'Pre-Chat Survey'}
          </h1>
          <p className="text-gray-700 leading-relaxed text-left">
            {isPostSurvey 
              ? 'Please reflect on your experience and answer the following questions.'
              : 'Please answer the following questions about your current situation.'
            }
          </p>
        </div>
        
        <div className="space-y-8">
          {/* Main survey questions (1-7 scale) */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Survey Questions</h2>
            <p className="text-sm text-gray-600">Rate each item on a scale from 1 to 7.</p>
            {currentQuestions.map((question, index) => (
              <div key={question.id} className="space-y-4">
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

          {/* PANAS emotion items (1-5 scale) */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Current Emotions</h2>
            <p className="text-sm text-gray-600">
              Thinking about the situation you {isPostSurvey ? 'discussed' : 'just described'}, please rate how much you feel each emotion at this moment. Use the scale from 1 (very slightly or not at all) to 5 (extremely).
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {PANAS_ITEMS.map((item) => (
                <PANASScale
                  key={item.id}
                  value={panasResponses[item.id] || null}
                  onChange={(value) => handlePanasResponseChange(item.id, value)}
                  label={item.label}
                />
              ))}
            </div>
          </div>
          
          {/* Open response field for post-survey */}
          {isPostSurvey && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Reflection</h2>
              <div className="text-lg font-medium">
                Please share your thoughts about this AI conversation experience. What did you find helpful or challenging? How did it make you feel?
              </div>
              <div className="space-y-2">
                <textarea
                  value={openResponse}
                  onChange={(e) => setOpenResponse(e.target.value)}
                  placeholder="Share your thoughts and feelings about the conversation..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  minLength={20}
                />
                <div className="text-sm text-gray-500">
                  {openResponse.length < 20 ? (
                    <span className="text-red-600">
                      Please enter at least 20 characters ({20 - openResponse.length} more needed)
                    </span>
                  ) : (
                    <span className="text-green-600">
                      ✓ Response length requirement met ({openResponse.length} characters)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center pt-6">
          <button
            onClick={handleNext}
            disabled={!isComplete || isLoading}
            className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium cursor-pointer"
          >
            {isLoading ? 'Submitting...' : (isPostSurvey ? 'Complete' : 'Next')}
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
