import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { sendChatbotMessage } from '../services/chatbotService';

const createMessage = (role, content) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  content,
});

const DEFAULT_QUICK_PROMPTS = [
  'Search prices',
  'Find services',
  'Booking help',
];

const QUICK_PROMPTS_BY_VIEW = {
  'client-dashboard': ['Find services', 'Book a provider', 'Search prices'],
  'browse-services': ['Search prices', 'Compare providers', 'Ask for a quote'],
  'my-bookings': ['Reschedule booking', 'Payment status', 'Request refund'],
  'my-work': ['Add service slots', 'Update payment options', 'Handle quotes'],
  'worker-dashboard': ['Improve listing', 'Manage schedule', 'Payment setup'],
  profile: ['Update profile', 'Change location', 'Account privacy'],
  'account-settings': ['Change password', 'Identity verification', 'Privacy settings'],
  settings: ['Change theme', 'Language settings', 'Notification settings'],
};

const LOCAL_SHORTCUT_REPLIES = {
  hi: 'Hi. What would you like to do in GigLink: find a service, check a booking, or set up seller tools?',
  hello: 'Hi. What would you like to do in GigLink: find a service, check a booking, or set up seller tools?',
  hey: 'Hi. What would you like to do in GigLink: find a service, check a booking, or set up seller tools?',
  help: 'I can help with services, bookings, seller setup, quotes, payments, refunds, profiles, or settings. What are you trying to do right now?',
  qr: 'Do you mean a seller payment QR, identity verification, or a booking payment step?',
  id: 'Do you mean identity verification, your profile details, or an account issue?',
  ok: 'Got it. What would you like to do next in GigLink?',
};

const LOW_CONFIDENCE_REPLIES_BY_VIEW = {
  'browse-services': 'I did not catch that yet. Are you trying to search providers, compare a service, or start a booking?',
  'my-bookings': 'I did not catch that yet. Are you checking a booking, rescheduling, paying, or asking about a refund?',
  'my-work': 'I did not catch that yet. Are you updating services, editing slots, handling quotes, or setting payment options?',
  'worker-dashboard': 'I did not catch that yet. Are you improving your listing, checking work, or managing your schedule?',
  profile: 'I did not catch that yet. Are you updating profile details, location, privacy, or account information?',
  'account-settings': 'I did not catch that yet. Are you changing your password, privacy settings, or identity verification details?',
  settings: 'I did not catch that yet. Are you changing theme, language, or notification preferences?',
};

const DEFAULT_LOW_CONFIDENCE_REPLY = 'I did not catch that yet. Are you trying to find a service, check a booking, manage seller work, or handle payments?';

const normalizeSignal = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const isLowConfidenceInput = (value) => {
  const cleanValue = String(value || '').trim();
  const compactValue = normalizeSignal(cleanValue);

  if (!compactValue || LOCAL_SHORTCUT_REPLIES[compactValue]) return false;
  if (compactValue.length <= 2) return true;
  if (compactValue.length <= 4 && /^([a-z0-9])\1+$/.test(compactValue)) return true;

  return false;
};

const getLocalAssistantReply = (input, context) => {
  const compactValue = normalizeSignal(input);

  if (LOCAL_SHORTCUT_REPLIES[compactValue]) {
    return LOCAL_SHORTCUT_REPLIES[compactValue];
  }

  if (!isLowConfidenceInput(input)) {
    return '';
  }

  return LOW_CONFIDENCE_REPLIES_BY_VIEW[context?.currentView] || DEFAULT_LOW_CONFIDENCE_REPLY;
};

const getQuickPrompts = (currentView, role) => {
  const viewPrompts = QUICK_PROMPTS_BY_VIEW[currentView] || DEFAULT_QUICK_PROMPTS;
  const prompts = role === 'worker' && currentView !== 'my-work' && currentView !== 'worker-dashboard'
    ? [...viewPrompts.slice(0, 2), 'Manage my work']
    : viewPrompts;

  return Array.from(new Set(prompts)).slice(0, 3);
};

function FloatingChatbot({
  appTheme = 'light',
  currentView = 'landing',
  isLoggedIn = false,
  role = 'guest',
  isHidden = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState(() => [
    {
      id: 'assistant-welcome',
      role: 'assistant',
      content: 'Hi! I can help you browse services, understand bookings, set up seller tools, or find the right next step in GigLink.',
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const widgetClassName = [
    'gl-chatbot',
    isOpen ? 'open' : '',
    appTheme === 'dark' ? 'dark' : '',
    currentView === 'my-work' || currentView === 'worker-dashboard' ? 'work-view' : '',
  ].filter(Boolean).join(' ');

  const context = useMemo(() => ({
    currentView,
    isLoggedIn,
    role,
  }), [currentView, isLoggedIn, role]);

  const quickPrompts = useMemo(
    () => getQuickPrompts(currentView, role),
    [currentView, role]
  );

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 116)}px`;
  }, [inputValue, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [isOpen, isSending, messages]);

  const sendMessage = async (rawInput) => {
    const cleanInput = String(rawInput || '').trim();
    if (!cleanInput || isSending) return;

    const userMessage = createMessage('user', cleanInput);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue('');
    setErrorMessage('');

    const localReply = getLocalAssistantReply(cleanInput, context);
    if (localReply) {
      setMessages([
        ...nextMessages,
        createMessage('assistant', localReply),
      ]);
      return;
    }

    setIsSending(true);

    try {
      const response = await sendChatbotMessage({
        messages: nextMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        context,
      });

      setMessages((prevMessages) => [
        ...prevMessages,
        createMessage('assistant', response.message),
      ]);
    } catch (error) {
      setErrorMessage(error?.message || 'The assistant is unavailable right now.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (event) => {
    event?.preventDefault();
    await sendMessage(inputValue);
  };

  if (isHidden) return null;

  return (
    <aside className={widgetClassName} data-testid="floating-chatbot">
      {isOpen && (
        <section
          className="gl-chatbot-panel"
          role="dialog"
          aria-label="GigLink assistant"
          aria-modal="false"
        >
          <header className="gl-chatbot-header">
            <span className="gl-chatbot-header-icon">
              <Bot size={18} aria-hidden="true" />
            </span>
            <div>
              <h2>GigLink Assistant</h2>
              <p>Marketplace and booking help</p>
            </div>
            <button
              type="button"
              className="gl-chatbot-icon-button"
              aria-label="Close GigLink assistant"
              onClick={() => setIsOpen(false)}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="gl-chatbot-messages" aria-live="polite" aria-busy={isSending}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`gl-chatbot-message ${message.role}`}
                data-testid={`chatbot-message-${message.role}`}
              >
                {message.content}
              </div>
            ))}
            {isSending && (
              <div className="gl-chatbot-message assistant loading" data-testid="chatbot-loading">
                <Loader2 className="gl-spin" size={16} aria-hidden="true" />
                Thinking
              </div>
            )}
            <div className="gl-chatbot-scroll-anchor" ref={messagesEndRef} aria-hidden="true" />
          </div>

          {errorMessage && (
            <div className="gl-chatbot-error" role="alert">
              {errorMessage}
            </div>
          )}

          <form className="gl-chatbot-form" onSubmit={handleSendMessage}>
            <div className="gl-chatbot-suggestions" aria-label="Suggested GigLink questions">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="gl-chatbot-suggestion"
                  disabled={isSending}
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSendMessage(event);
                }
              }}
              aria-label="Message GigLink assistant"
              placeholder="Ask about bookings or services"
              rows={1}
            />
            <button
              type="submit"
              className="gl-chatbot-send"
              aria-label="Send message"
              disabled={!inputValue.trim() || isSending}
            >
              {isSending ? <Loader2 className="gl-spin" size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="gl-chatbot-toggle"
        aria-label={isOpen ? 'Close GigLink assistant' : 'Open GigLink assistant'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        {isOpen ? <X size={24} aria-hidden="true" /> : <MessageCircle size={25} aria-hidden="true" />}
      </button>
    </aside>
  );
}

export default FloatingChatbot;
