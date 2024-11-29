import { useState, useEffect, useRef, useLayoutEffect } from "react";
import ChatMessage from "./ChatMessage";
import { sendMessage, getMessages } from "../../lib/chat";
import { auth } from "../../../firebase-client";
import { useAuth } from '../../contexts/AuthContext';
import { getProfileInfo } from "../../lib/action";
import { FaFileUpload } from 'react-icons/fa';
import LoadingTab from "../LoadingTab";
import { uploadFile } from '../../lib/fileUpload';

function ChatTab({ groupId }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const firstLoadRef = useRef(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [error, setError] = useState(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  const scrollToBottom = (instant = false) => {
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  const isAtBottom = () => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) return false;
    
    const threshold = 100; 
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  useEffect(() => {
    if (!groupId || !user) return;

    const fetchMessages = async () => {
      const idToken = await user.getIdToken();
      const result = await getMessages(groupId, idToken);
      if (result.success) {
        setMessages(result.messages);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [groupId, user]);

  useEffect(() => {
    if (!groupId) return;

    const fetchProfile = async () => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const [profileResult, messagesResult] = await Promise.all([
            getProfileInfo(idToken),
            getMessages(groupId, idToken)
          ]);
          
          if (profileResult.success) {
            setProfile(profileResult.profile);
          }
          if (messagesResult.success) {
            setMessages(messagesResult.messages);
            // Only instant scroll on first load
            if (firstLoadRef.current) {
              messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
              firstLoadRef.current = false;
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [groupId, user]);

  useLayoutEffect(() => {
    if (!loading && messages.length && !hasScrolled) {
      scrollToBottom(true);
      setHasScrolled(true);
    }
  }, [loading, messages, hasScrolled]);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current && isAtBottom()) {
      scrollToBottom(false);
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  if (loading) {
    return <LoadingTab />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupId) return;

    const messageText = newMessage;
    setNewMessage(""); 

    const idToken = await auth.currentUser.getIdToken();
    const result = await sendMessage(
      messageText,
      auth.currentUser.uid,
      groupId,
      idToken
    );

    if (!result.success) {
      setNewMessage(messageText);
      console.error('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setError(null);
      handleSubmit(e);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const validateFileSize = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB');
      return false;
    }
    return true;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file || !groupId) return;

    if (!validateFileSize(file)) return;

    try {
      setError(null);
      const idToken = await user.getIdToken();
      const uploadResult = await uploadFile(file, groupId, idToken);
      
      if (!uploadResult.success || !uploadResult.metadata) {
        throw new Error('File upload failed');
      }

      // Send message with file metadata
      const result = await sendMessage(
        null,
        auth.currentUser.uid,
        groupId,
        idToken,
        uploadResult.metadata
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to send file message');
      }
    } catch (error) {
      console.error('Failed to handle file:', error);
      setError(error.message || 'Failed to upload file');
    }
  };

  return (
    <div 
      className="flex flex-col gap-4 justify-end w-full m-4 relative"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-gray-100/90 flex flex-col items-center justify-center z-10 rounded-lg border-2 border-dashed border-blue-400 transition-all duration-200">
          <FaFileUpload className="w-16 h-16 text-blue-400 mb-4" />
          <p className="text-xl text-blue-600 font-semibold">Drop your file here to upload</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg) => (  
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="sticky border-0 w-full px-[12px] py-[8px] bg-shade-300 placeholder-text placeholder:italic rounded-[5px] focus:ring-0" 
          placeholder="Type a message" 
        />
      </form>
    </div>
  );
}

export default ChatTab;