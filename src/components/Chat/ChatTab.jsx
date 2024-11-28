import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { sendMessage, getMessages } from "../../lib/chat";
import { auth } from "../../../firebase-client";
import LoadingScreen from "../LoadingScreen";
import { useAuth } from '../../contexts/AuthContext';
import { getProfileInfo } from "../../lib/action";

function ChatTab({ groupId }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [groupId, user]);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  if (loading) {
    return <LoadingScreen />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupId) return;

    const messageText = newMessage;
    setNewMessage(""); // Clear input immediately for better UX

    const idToken = await auth.currentUser.getIdToken();
    const result = await sendMessage(
      messageText,
      auth.currentUser.uid,
      groupId,
      idToken
    );

    if (!result.success) {
      // Revert on failure
      setNewMessage(messageText);
      console.error('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col gap-4 justify-end w-full m-4">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg) => (  
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
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