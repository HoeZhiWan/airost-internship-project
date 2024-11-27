function ChatMessage({ message }) {
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

  return (
    <div className="flex mb-4">
      <img src="src\assets\Default_pfp.svg" alt="" className="w-12 h-12" />
      <div className="ms-[10px]">
        <div className="font-bold flex items-baseline">
          <div>{message.userName}</div>
          <div className="ms-2 font-thin text-[12px]">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
        <div className="">
          {message.text}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
