import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Paperclip, FileText, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const Chat = ({ messages, sendMessage, isOpen, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage({ text: inputText });
      setInputText('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert("Only Images and PDFs are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await axios.post('http://localhost:3001/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsUploading(false);
      
      // Emit chat message with file payload
      sendMessage({
        text: `Shared a file: ${res.data.fileName}`,
        fileUrl: res.data.fileUrl,
        fileName: res.data.fileName,
        fileType: res.data.fileType
      });

    } catch (err) {
      console.error(err);
      alert('Failed to upload file');
      setIsUploading(false);
    }
    
    // Clear file input
    fileInputRef.current.value = '';
  };

  return (
    <div className={`chat-sidebar ${isOpen ? '' : 'hidden'}`}>
      <div className="chat-header">
        <span>In-call chat</span>
        <button className="btn btn-icon" onClick={onClose} style={{ width: '32px', height: '32px', background: 'transparent' }}>
          <X size={18} />
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isSelf ? 'self' : 'other'}`}>
            {!msg.isSelf && <span className="message-sender">{msg.sender}</span>}
            
            {/* File Attachments Presentation */}
            {msg.fileUrl && msg.fileType?.startsWith('image/') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
                <img src={msg.fileUrl} alt="attachment" style={{ width: '100%', borderRadius: '8px' }} />
                <a href={msg.fileUrl} download={msg.fileName || "photo.jpg"} style={{fontSize: '0.75rem', color: '#a5b4fc', textDecoration: 'none', alignSelf: 'flex-start'}}>Download</a>
              </div>
            )}
            
            {msg.fileUrl && msg.fileType === 'application/pdf' && (
              <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none', background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                <FileText size={20} />
                <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.fileName}</span>
              </a>
            )}

            {/* Text Message */}
            {msg.text}
          </div>
        ))}
        {isUploading && <div className="message other" style={{ fontStyle: 'italic', opacity: 0.7 }}>Uploading...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <button 
          type="button" 
          className="btn btn-icon" 
          style={{ width: '48px', height: '48px', background: 'var(--glass-bg)' }}
          onClick={() => fileInputRef.current.click()}
        >
          <Paperclip size={18} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          style={{ display: 'none' }} 
          accept="image/*, .pdf"
          onChange={handleFileUpload}
        />

        <input 
          type="text" 
          placeholder="Send a message..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
