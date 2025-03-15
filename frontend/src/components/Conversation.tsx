'use client';

import { useConversation } from '@11labs/react';
import { useCallback } from 'react';
import DynamicVariables from '@/models/dynamicVariables';
import GradientButton from './GradientButton';
import { Loader2, Mic, MicOff } from 'lucide-react';
import Message from '@/models/message';
import { GiftUserProfile, LLMResponse } from '@/types/profile';

interface ConversationProps {
  dynamicVariables: DynamicVariables;
  onMessage: (message: Message) => void;
  clearTranscript: () => void;
  setInCall: (inMeeting: boolean) => void;
  onToolUsed: (toolName: string) => void;

  handleSubmitAnswer: (answer: string) => Promise<string>;
  addToQuestions: (question: string) => void;

}

export function Conversation(
  { dynamicVariables, onMessage, clearTranscript, setInCall, onToolUsed, handleSubmitAnswer, addToQuestions}: ConversationProps
) {
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
      setInCall(true);
    },
    onDisconnect: () => {
      console.log('Disconnected');
      setInCall(false);
      clearTranscript();
    },
    onMessage: onMessage,
    onError: (error: string) => console.error('Error:', error),
    onUnhandledClientToolCall: (params: { tool_name: string; tool_call_id: string; parameters: any; expects_response: boolean; }) => {
      console.log('Unhandled client tool call:', params.tool_name);
    },
  });

  
  
  
  const clientTools = {
    submitUserAnswerAndGetNextQuestion: async ({user_answer}: {user_answer: string}) => {
      console.log("submitUserAnswerAndGetNextQuestion called");
      onToolUsed("Submitting answer...")
      console.log(user_answer);
      
      const response = await handleSubmitAnswer(user_answer);

      return response;
    },
    askQuestion: async ({question}: {question: string}) => {
      console.log("askQuestion called");
      onToolUsed("Asking question...")

      addToQuestions(question);
    },
  };

  
  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const cleanedVariables: Record<string, string | number | boolean> = {};
      Object.entries(dynamicVariables).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanedVariables[key] = value;
        }
      });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '',
        clientTools: clientTools,
        dynamicVariables: cleanedVariables,
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation, dynamicVariables]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {conversation.status === 'connecting' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-background text-text rounded">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Connecting</span>
          </div>
        )}

        {conversation.status === 'connected' && (
          <button
            onClick={stopConversation}
            className="p-4 rounded-full shadow-lg transition-all duration-300 relative overflow-hidden group"
            style={{ 
              background: "linear-gradient(to right, #E77ED6, #E87BB3, #E77ED6)",
              backgroundSize: "200% auto",
            }}
          >
            <MicOff className="w-6 h-6 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
            <span 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ 
                background: "linear-gradient(to right, #E87BB3, #E77ED6, #E87BB3)",
                backgroundSize: "200% auto",
                animation: "gradient-shift 3s ease infinite",
              }}
            ></span>
            <style jsx>{`
              @keyframes gradient-shift {
                0% { background-position: 0% center; }
                50% { background-position: 100% center; }
                100% { background-position: 0% center; }
              }
            `}</style>
          </button>
        )}

        {conversation.status !== 'connecting' && conversation.status !== 'connected' && (
          <button
            onClick={startConversation}
            className="p-4 rounded-full shadow-lg transition-all duration-300 relative overflow-hidden group"
            style={{ 
              background: "linear-gradient(to right, #E77ED6, #E87BB3, #E77ED6)",
              backgroundSize: "200% auto",
            }}
          >
            <Mic className="w-6 h-6 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
            <span 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ 
                background: "linear-gradient(to right, #E87BB3, #E77ED6, #E87BB3)",
                backgroundSize: "200% auto",
                animation: "gradient-shift 3s ease infinite",
              }}
            ></span>

          </button>
        )}
      </div>
    </div>
  );  
}
