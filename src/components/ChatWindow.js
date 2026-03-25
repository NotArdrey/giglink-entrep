import React, { useState, useEffect } from 'react';
import '../styles/ChatWindow.css';

/**
 * ChatWindow Component
 * 
 * Simulates Shopee-style messaging with quote negotiation.
 * 
 * Flow:
 * 1. Component mounts with worker's quote already sent (simulated)
 * 2. Client sees quote message and "Approve Quote" button
 * 3. Client can type a message to negotiate (optional)
 * 4. Clicking "Approve Quote" transitions to slot selection
 * 
 * Note: This is a UI simulation. In a real app, this would connect to a socket
 * or polling system to receive actual worker messages.
 */
const ChatWindow = ({ booking, onApproveQuote, onCancel, onStopServiceAccepted }) => {
  // Message history: array of { sender: 'worker' | 'client', type: 'text' | 'quote', content, timestamp }
  const [messages, setMessages] = useState([]);
  const [clientMessage, setClientMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStopRequestPending, setIsStopRequestPending] = useState(false);

  const isRecurringService = booking?.billingCycle === 'weekly' || booking?.billingCycle === 'monthly';
  const isServiceStopped = booking?.status === 'Service Stopped' || booking?.serviceActive === false;
  
  // On component mount, simulate receiving worker's quote message
  useEffect(() => {
    // Simulate a slight delay for loading the chat history
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          sender: 'worker',
          type: 'text',
          content: `Hi! I've reviewed your request for ${booking.serviceType.toLowerCase()}. I can help you with that.`,
          timestamp: '10:15 AM',
        },
        {
          id: 2,
          sender: 'worker',
          type: 'text',
          content: "Based on the scope of work you described, here's my quote:",
          timestamp: '10:16 AM',
        },
        {
          id: 3,
          sender: 'worker',
          type: 'quote',
          content: {
            amount: booking.quoteAmount,
            description: booking.description,
            deliveryTime: '2-3 days',
            note: 'Price includes materials and labor',
          },
          timestamp: '10:16 AM',
        },
      ]);
      setIsLoading(false);
      setIsStopRequestPending(false);
    }, 500);
  }, [booking]);
  
  /**
   * handleSendMessage()
   * Allows client to send a negotiation message (optional)
   * Simulates worker responding after a short delay
   */
  const handleSendMessage = () => {
    if (!clientMessage.trim()) return;
    
    // Add client's message to chat
    const newMessage = {
      id: messages.length + 1,
      sender: 'client',
      type: 'text',
      content: clientMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMessage]);
    setClientMessage('');
    
    // Simulate worker's response after 1 second
    setTimeout(() => {
      const workerResponse = {
        id: messages.length + 2,
        sender: 'worker',
        type: 'text',
        content: "Thanks for your message. I'm confident I can deliver quality work at the quoted price. Feel free to approve the quote when ready!",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prevMessages => [...prevMessages, workerResponse]);
    }, 1000);
  };
  
  /**
   * handleApproveQuote()
   * Transition: Chat Window → Slot Selection
   * Calls parent callback to move to slot selection UI
   */
  const handleApproveQuoteClick = () => {
    // Add system message indicating approval
    const approvalMessage = {
      id: messages.length + 1,
      sender: 'system',
      type: 'text',
      content: 'You approved the quote. Proceeding to slot selection...',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, approvalMessage]);
    
    // Transition after brief delay so user sees the system message
    setTimeout(() => {
      onApproveQuote();
    }, 800);
  };

  const handleRequestStopService = () => {
    if (isStopRequestPending || isServiceStopped) return;

    const requestMessage = {
      id: `stop-request-${Date.now()}`,
      sender: 'client',
      type: 'text',
      content: 'I would like to stop this recurring service. Please confirm cancellation.',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prevMessages) => [...prevMessages, requestMessage]);
    setIsStopRequestPending(true);

    setTimeout(() => {
      const workerApprovalMessage = {
        id: `stop-worker-${Date.now()}`,
        sender: 'worker',
        type: 'text',
        content: 'Understood. I accept your request to stop this recurring service. We will end billing starting this cycle.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      const systemStopMessage = {
        id: `stop-system-${Date.now() + 1}`,
        sender: 'system',
        type: 'text',
        content: 'Service stop confirmed by worker. Recurring billing is now stopped.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prevMessages) => [...prevMessages, workerApprovalMessage, systemStopMessage]);
      setIsStopRequestPending(false);
      if (onStopServiceAccepted) {
        onStopServiceAccepted();
      }
    }, 1200);
  };
  
  return (
    <div className="chat-overlay">
      <div className="chat-card">
        {/* Header with worker info */}
        <div className="chat-header">
          <div className="worker-info">
            <div className="worker-avatar">{booking.workerName.charAt(0)}</div>
            <div>
              <h3>{booking.workerName}</h3>
              <p className="worker-service">{booking.serviceType}</p>
              <p className="worker-status">● Online</p>
              {isRecurringService && !isServiceStopped && (
                <p className="recurring-badge">
                  Recurring {booking.billingCycle === 'monthly' ? 'Monthly' : 'Weekly'} Service
                </p>
              )}
              {isServiceStopped && <p className="stopped-badge">Service Stopped</p>}
            </div>
          </div>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>
        
        {/* Message history */}
        <div className="chat-messages">
          {isLoading ? (
            <div className="loading-state">
              <p>Loading chat history...</p>
              <div className="spinner"></div>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`chat-message chat-message-${msg.sender}${msg.type === 'quote' ? ' chat-message-quote' : ''}`}
              >
                {msg.type === 'text' && msg.sender !== 'system' && (
                  <>
                    <p className="chat-message-text">{msg.content}</p>
                    <span className="chat-message-time">{msg.timestamp}</span>
                  </>
                )}
                
                {msg.type === 'quote' && (
                  <div className="quote-card">
                    <div className="quote-header">
                      <p className="quote-label">💰 Price Quote</p>
                    </div>
                    <div className="quote-body">
                      <div className="quote-amount">₱{msg.content.amount}</div>
                      <p className="quote-description">{msg.content.description}</p>
                      <p className="quote-delivery">
                        <span className="label">Estimated Delivery:</span>
                        <span>{msg.content.deliveryTime}</span>
                      </p>
                      <p className="quote-note">{msg.content.note}</p>
                    </div>
                  </div>
                )}
                
                {msg.type === 'text' && msg.sender === 'system' && (
                  <p className="chat-system-message">{msg.content}</p>
                )}
              </div>
            ))
          )}
          
          {/* Floating Action Bar - Always visible for quote approval */}
          {!isLoading && !booking.quoteApproved && !isServiceStopped && !messages.some(m => m.sender === 'system') && (
            <div className="quote-action-bar">
              <div className="action-content">
                <p className="action-prompt">Do you want to proceed with this quote?</p>
                <button
                  className="btn-approve-quote"
                  onClick={handleApproveQuoteClick}
                >
                  ✓ Approve Quote & Select Slot
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Message input area */}
        {!booking.quoteApproved && !isServiceStopped && (
          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Ask a question or discuss the quote..."
              value={clientMessage}
              onChange={(e) => setClientMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="message-input"
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!clientMessage.trim()}
            >
              Send
            </button>
            {isRecurringService && (
              <button
                className="stop-service-btn"
                onClick={handleRequestStopService}
                disabled={isStopRequestPending}
              >
                {isStopRequestPending ? 'Waiting...' : 'Request Stop'}
              </button>
            )}
          </div>
        )}
        
        {/* Show approval status */}
        {booking.quoteApproved && (
          <div className="approval-status">
            <p>✓ Quote Approved - Proceeding to slot selection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
