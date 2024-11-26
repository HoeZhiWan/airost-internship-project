function ChatMessage() {
  return (
    <div className="flex">
        {/* profile picture */}
        <img src="src\assets\Default_pfp.svg" alt="" className="w-12 h-12" />
        <div className="ms-[10px] ">
            <div className="font-bold flex items-baseline">
                {/* Name */}
                <div className="">Alfred</div>
                {/* TImestamp */}
                <div className="ms-2 font-thin text-[12px]">Today at 10:03 PM</div>
            </div>
            {/* chat messages */}
            <div className="">
                Text
            </div>
        </div>
    </div>
  )
}

export default ChatMessage
