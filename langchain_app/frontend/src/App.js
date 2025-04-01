import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { FiSend, FiMessageSquare, FiTrash2 } from 'react-icons/fi';

function App() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) {
      return;
    }
    
    setLoading(true);
    
    const newEntryId = Date.now();
    const newEntry = {
      id: newEntryId,
      question: question,
      answer: null,
      timestamp: new Date().toLocaleString(),
      pending: true
    };
    
    setHistory(prevHistory => [...prevHistory, newEntry]);
    
    try {
      const response = await axios.post('http://localhost:8000/api/ask/', { question });
      
      setHistory(prevHistory => 
        prevHistory.map(entry => 
          entry.id === newEntryId 
            ? { 
                ...entry, 
                answer: response.data.answer, 
                pending: false 
              } 
            : entry
        )
      );
      
      setQuestion('');
    } catch (error) {
      const errorMessage = `Error: ${error.response?.data?.error || error.message}`;
      
      setHistory(prevHistory => 
        prevHistory.map(entry => 
          entry.id === newEntryId 
            ? { 
                ...entry, 
                answer: errorMessage, 
                pending: false,
                isError: true 
              } 
            : entry
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="logo">
          <FiMessageSquare className="logo-icon" />
          <h1>LangChain <span>Q&A</span></h1>
        </div>
        <div className="info-box">
          <h3>About</h3>
          <p>Ask any question and get answers powered by LangChain and Hugging Face models.</p>
        </div>
        <div className="actions">
          <button 
            onClick={handleClearHistory} 
            className="clear-button"
            disabled={history.length === 0 || loading}
          >
            <FiTrash2 /> Clear History
          </button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="chat-container">
          <div className="messages-area">
            {history.length === 0 ? (
              <div className="empty-state">
                <FiMessageSquare className="empty-icon" />
                <h2>No conversations yet</h2>
                <p>Ask a question to get started!</p>
              </div>
            ) : (
              <>
                {history.map((entry) => (
                  <div key={entry.id} className="qa-entry">
                    <div className="question-bubble">
                      <div className="question-text">{entry.question}</div>
                      <div className="timestamp">{entry.timestamp}</div>
                    </div>
                    
                    {entry.pending ? (
                      <div className="answer-bubble loading">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    ) : (
                      <div className={`answer-bubble ${entry.isError ? 'is-error' : ''}`}>
                        <div className="answer-text">{entry.answer}</div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          <div className="input-container">
            <textarea
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask something..."
              rows="1"
              disabled={loading}
              className="question-input"
            />
            <button 
              onClick={handleAsk} 
              disabled={!question.trim() || loading}
              className={`send-button ${!question.trim() || loading ? 'disabled' : ''}`}
              aria-label="Send question"
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;