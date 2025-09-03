'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CHATBOT_CONDITIONS } from '@/lib/chatbot-prompts';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function ChatContent() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conditionId, setConditionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [situationDescription, setSituationDescription] = useState<string>('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const MAX_CONVERSATIONS = 10;

  useEffect(() => {
    const session = searchParams.get('session');
    const condition = searchParams.get('condition');
    
    if (!session || !condition) {
      router.push('/');
      return;
    }
    
    setSessionId(session);
    setConditionId(condition);
    
    // Fetch the user's situation description
    fetchSituationDescription(session);
  }, [searchParams, router]);

  const fetchSituationDescription = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSituationDescription(data.situation_description || data.situationDescription || '');
      }
    } catch (error) {
      console.error('Error fetching situation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const condition = conditionId ? CHATBOT_CONDITIONS[conditionId] : null;
  
  // Check if this is a self-talk mode (self-clone conditions)
  const isSelfTalkMode = condition?.id === 'sycophantic-self' || condition?.id === 'antagonistic-self';

  const handleFinishConversation = async () => {
    if (!sessionId) return;
    
    // Log the early termination
    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          interactionType: 'conversation_finished_early',
          data: { 
            totalExchanges: conversationCount,
            maxExchanges: MAX_CONVERSATIONS,
            timestamp: new Date().toISOString()
          },
        }),
      });
    } catch (error) {
      console.error('Error logging early termination:', error);
    }
    
    // Navigate to landscape assessment
    router.push(`/landscape?session=${sessionId}`);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !sessionId || !condition || isComplete) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Log the user message
      await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          interactionType: 'chat_message',
          data: { 
            role: 'user', 
            content: userMessage.content,
            condition: condition.id,
            conversationCount: conversationCount + 1,
            timestamp: userMessage.timestamp.toISOString()
          },
        }),
      });

      // Call OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          systemPrompt: condition.systemPrompt,
          situationDescription,
          conversationCount: conversationCount + 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Log the assistant message
      await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          interactionType: 'chat_message',
          data: { 
            role: 'assistant', 
            content: assistantMessage.content,
            condition: condition.id,
            conversationCount: conversationCount + 1,
            timestamp: assistantMessage.timestamp.toISOString()
          },
        }),
      });

      const newCount = conversationCount + 1;
      setConversationCount(newCount);

      // Check if we've reached the conversation limit
      if (newCount >= MAX_CONVERSATIONS) {
        setIsComplete(true);
        // Optionally redirect after a delay or show completion UI
        setTimeout(() => {
          router.push(`/landscape?session=${sessionId}`);
        }, 3000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!sessionId || !condition) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-10 h-10 relative">
            <Image
              src={`/${condition.color}.png`}
              alt={condition.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <div>
            <h1 className="text-lg font-medium">{condition.name}</h1>
            <p className="text-sm text-gray-600">{condition.description}</p>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            {conversationCount}/{MAX_CONVERSATIONS} exchanges
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mb-8">
              <p className="mb-4">Your AI companion is ready to help you explore your situation:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
                <p className="text-sm text-blue-800 italic">&ldquo;{situationDescription}&rdquo;</p>
              </div>
              <p className="mt-4 text-sm">Start the conversation by sharing your thoughts or asking a question.</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-6 flex ${isSelfTalkMode ? 'justify-start' : (message.role === 'user' ? 'justify-end' : 'justify-start')}`}
            >
              <div
                className={`max-w-3xl px-6 py-4 rounded-lg ${
                  isSelfTalkMode
                    ? (message.role === 'user' 
                        ? 'bg-gray-800 text-white border-2 border-gray-700' 
                        : 'bg-white text-black border-2 border-black')
                    : (message.role === 'user'
                        ? 'bg-gray-800 text-white'
                        : `bg-${condition.color}-50 border border-${condition.color}-200`)
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-2 ${
                  isSelfTalkMode
                    ? (message.role === 'user' ? 'text-gray-300' : 'text-gray-600')
                    : (message.role === 'user' ? 'text-gray-300' : 'text-gray-500')
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className={`max-w-3xl px-6 py-4 rounded-lg ${
                isSelfTalkMode 
                  ? 'bg-white text-black border-2 border-black' 
                  : `bg-${condition.color}-50 border border-${condition.color}-200`
              }`}>
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">Thinking...</div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      {!isComplete ? (
        <div className="bg-white border-t px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 mb-4">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
              >
                Send
              </button>
            </div>
            {/* Finish conversation button */}
            {messages.length > 0 && (
              <div className="text-center">
                <button
                  onClick={handleFinishConversation}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Finish conversation and continue
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border-t px-6 py-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-green-800 mb-2">Session Complete</h3>
              <p className="text-green-700">
                You&apos;ve completed your 10-exchange conversation. You&apos;ll be redirected to continue your assessment shortly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading your AI companion...</p>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
