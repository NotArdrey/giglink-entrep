import React, { useState } from 'react';
import '../styles/SimulatedChat.css';

/**
 * SimulatedChat Component
 * 
 * Quick-chat interface for responding to client inquiries.
 * Shows simulated conversation and allows for quick responses.
 * 
 * INQUIRY-BASED FLOW:
 * - Worker can send custom quotes with amounts via modal
 * - Quote appears as special card in chat (not just text)
 * - Client can accept, negotiate, or provide feedback
 * - Simulates realistic negotiation process for inquiry-based services
 */
const SimulatedChat = ({ inquiry, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'client',
      type: 'text',
      text: `Hi! I'm interested in ${inquiry.service.toLowerCase()}. Are you available?`,
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      sender: 'client',
      type: 'text',
      text: inquiry.description,
      timestamp: '10:31 AM',
    },
  ]);
  
  const [replyText, setReplyText] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDescription, setQuoteDescription] = useState('');
  
  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    // Add seller's message
    const newMessage = {
      id: messages.length + 1,
      sender: 'seller',
      type: 'text',
      text: replyText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMessage]);
    setReplyText('');
    
    // Simulate client response after 2 seconds
    setTimeout(() => {
      const clientResponse = {
        id: messages.length + 2,
        sender: 'client',
        type: 'text',
        text: 'Great! When can we proceed with this?',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prevMessages => [...prevMessages, clientResponse]);
    }, 2000);
  };
  
  /**
   * handleOpenQuoteModal()
   * Opens quote input dialog where worker enters custom amount
   */
  const handleOpenQuoteModal = () => {
    setShowQuoteModal(true);
    setQuoteAmount('');
    setQuoteDescription('');
  };
  
  /**
   * handleSendQuote()
   * Sends quote with worker-entered amount as special message card
   * Client can then accept or negotiate in the chat
   */
  const handleSendQuote = () => {
    if (!quoteAmount.trim()) {
      alert('Please enter a quote amount');
      return;
    }
    
    // Add seller's quote message
    const quoteMessage = {
      id: messages.length + 1,
      sender: 'seller',
      type: 'quote',
      amount: quoteAmount,
      description: quoteDescription || `Quote for ${inquiry.service}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, quoteMessage]);
    setShowQuoteModal(false);
    setQuoteAmount('');
    setQuoteDescription('');
    
    // Simulate client response after 2.5 seconds
    setTimeout(() => {
      const clientResponse = {
        id: messages.length + 2,
        sender: 'client',
        type: 'text',
        text: 'Thanks for the quote! This looks reasonable. Can we proceed to booking?',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prevMessages => [...prevMessages, clientResponse]);
    }, 2500);
  };
  
  const handleQuickReply = (template) => {
    setReplyText(template);
  };
  
  return (
    <div className="chat-overlay">
      <div className="chat-modal">
        {/* Header */}
        <div className="chat-modal-header">
          <div className="chat-client-info">
            <img src={inquiry.clientPhoto} alt={inquiry.clientName} className="chat-client-photo" />
            <div>
              <h3>{inquiry.clientName}</h3>
              <p>{inquiry.service}</p>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose}>✕</button>
        </div>
        
        {/* Messages */}
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message message-${msg.sender}`}>
              {msg.type === 'text' && (
                <>
                  <p className="message-text">{msg.text}</p>
                  <span className="message-time">{msg.timestamp}</span>
                </>
              )}
              
              {msg.type === 'quote' && (
                <div className="quote-message">
                  <div className="quote-card-header">
                    <span className="quote-icon">💰</span>
                    <span className="quote-label">Price Quote</span>
                  </div>
                  <div className="quote-card-body">
                    <div className="quote-amount">₱{msg.amount}</div>
                    <p className="quote-description">{msg.description}</p>
                  </div>
                  <span className="message-time">{msg.timestamp}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Quick Reply Templates */}
        <div className="quick-replies">
          <button
            className="quick-reply-btn"
            onClick={() => handleQuickReply("Yes, I'm available! Let me know your preferred time.")}
          >
            Accept
          </button>
          <button
            className="quick-reply-btn send-quote-btn"
            onClick={handleOpenQuoteModal}
          >
            Send Quote
          </button>
          <button
            className="quick-reply-btn"
            onClick={() => handleQuickReply("I need a bit more information to provide an accurate quote.")}
          >
            Ask Details
          </button>
        </div>
        
        {/* Input Area */}
        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Type your message..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
            className="chat-input"
          />
          <button
            className="chat-send-btn"
            onClick={handleSendReply}
            disabled={!replyText.trim()}
          >
            Send
          </button>
        </div>
      </div>
      
      {/* QUOTE INPUT MODAL */}
      {showQuoteModal && (
        <div className="quote-modal-overlay">
          <div className="quote-modal">
            <div className="quote-modal-header">
              <h3>Send Price Quote</h3>
              <button className="quote-modal-close" onClick={() => setShowQuoteModal(false)}>✕</button>
            </div>
            
            <div className="quote-modal-content">
              <div className="form-group">
                <label htmlFor="quote-amount">Quote Amount (₱)</label>
                <input
                  id="quote-amount"
                  type="number"
                  placeholder="e.g., 1500"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  min="0"
                  step="50"
                  className="quote-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="quote-description">Quote Description (Optional)</label>
                <textarea
                  id="quote-description"
                  placeholder="e.g., Includes materials and labor, 2-3 days delivery..."
                  value={quoteDescription}
                  onChange={(e) => setQuoteDescription(e.target.value)}
                  rows={3}
                  className="quote-textarea"
                />
              </div>
              
              <div className="quote-preview">
                <p className="preview-label">Preview:</p>
                <div className="quote-preview-card">
                  <span className="preview-amount">₱{quoteAmount || '—'}</span>
                  <p className="preview-desc">{quoteDescription || `Quote for ${inquiry.service}`}</p>
                </div>
              </div>
            </div>
            
            <div className="quote-modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowQuoteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-send-quote"
                onClick={handleSendQuote}
                disabled={!quoteAmount.trim()}
              >
                Send Quote to Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulatedChat;
