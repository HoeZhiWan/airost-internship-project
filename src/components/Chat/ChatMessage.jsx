import { FaFile, FaDownload, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getUserProfile } from '../../lib/todos';
import { useAuth } from '../../contexts/AuthContext';

function ChatMessage({ message }) {
  const [showPreview, setShowPreview] = useState(false);
  const [username, setUsername] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!message.userId || !user) return;
      
      const idToken = await user.getIdToken();
      const result = await getUserProfile(message.userId, idToken);
      if (result.success) {
        setUsername(`${result.profile.firstName} ${result.profile.lastName}`);
      }
    };

    fetchUserProfile();
  }, [message.userId, user]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    try {
      let date;
      if (typeof timestamp === 'string' || timestamp instanceof Date) {
        date = new Date(timestamp);
      } else if (timestamp && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        return "";
      }

      if (isNaN(date.valueOf())) {
        return "";
      }

      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const isThisYear = date.getFullYear() === now.getFullYear();

      if (isToday) {
        return new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }).format(date);
      } else if (isThisYear) {
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }).format(date);
      } else {
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }).format(date);
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return "";
    }
  };

  const renderFilePreview = () => {
    if (!message.fileUrl) return null;

    const isImage = message.fileType?.startsWith('image/');
    
    return (
      <div className="mt-2">
        {isImage ? (
          <>
            <img 
              src={message.fileUrl} 
              alt={message.fileName}
              className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
              onClick={() => setShowPreview(true)}
            />
            {showPreview && (
              <div 
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={() => setShowPreview(false)}
              >
                <button 
                  className="absolute top-4 right-4 text-white hover:text-gray-300"
                  onClick={() => setShowPreview(false)}
                >
                  <FaTimes size={24} />
                </button>
                <img 
                  src={message.fileUrl} 
                  alt={message.fileName}
                  className="max-w-full max-h-[90vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </>
        ) : (
          <a 
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <FaFile className="text-gray-500"/>
            <span className="truncate text-gray-500">{message.fileName}</span>
            <FaDownload fill="#08BD7A"/>
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="flex mb-4">
      <img src="src\assets\Default_pfp.svg" alt="" className="w-12 h-12" />
      <div className="ms-[10px]">
        <div className="font-bold flex items-baseline">
          <div>{username}</div>
          <div className="ms-2 font-thin text-[12px]">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
        <div>
          {message.text}
          {renderFilePreview()}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
