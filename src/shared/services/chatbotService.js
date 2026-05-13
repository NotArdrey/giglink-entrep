import { supabase } from './supabaseClient';

const CHATBOT_FUNCTION_NAME = 'giglink-chatbot';

const normalizeMessage = (message) => ({
  role: message.role === 'assistant' ? 'assistant' : 'user',
  content: String(message.content || '').trim().slice(0, 1200),
});

export const sendChatbotMessage = async ({ messages, context }) => {
  const cleanMessages = (Array.isArray(messages) ? messages : [])
    .map(normalizeMessage)
    .filter((message) => message.content.length > 0)
    .slice(-10);

  if (cleanMessages.length === 0) {
    throw new Error('Type a message before sending.');
  }

  const { data, error } = await supabase.functions.invoke(CHATBOT_FUNCTION_NAME, {
    body: {
      messages: cleanMessages,
      context: {
        currentView: context?.currentView || 'landing',
        isLoggedIn: Boolean(context?.isLoggedIn),
        role: context?.role || 'guest',
      },
    },
  });

  if (error) {
    console.error('giglink-chatbot failed', {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error('The assistant is unavailable right now. Please try again in a moment.');
  }

  const message = typeof data?.message === 'string' ? data.message.trim() : '';
  if (!message) {
    throw new Error('The assistant returned an empty response. Please try again.');
  }

  return {
    message,
    model: data?.model || '',
  };
};
