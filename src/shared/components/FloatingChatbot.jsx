import { useMemo, useState } from 'react';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { sendChatbotMessage } from '../services/chatbotService';

const createMessage = (role, content) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  content,
});

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

  const visibleMessages = messages.slice(-12);

  const handleSendMessage = async (event) => {
    event?.preventDefault();

    const cleanInput = inputValue.trim();
    if (!cleanInput || isSending) return;

    const userMessage = createMessage('user', cleanInput);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue('');
    setErrorMessage('');
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

          <div className="gl-chatbot-messages" aria-live="polite">
            {visibleMessages.map((message) => (
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
          </div>

          {errorMessage && (
            <div className="gl-chatbot-error" role="alert">
              {errorMessage}
            </div>
          )}

          <form className="gl-chatbot-form" onSubmit={handleSendMessage}>
            <textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSendMessage(event);
                }
              }}
              aria-label="Message GigLink assistant"
              placeholder="Ask about bookings, sellers, or services"
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
