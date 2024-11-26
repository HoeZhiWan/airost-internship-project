import ChatMessage from "./ChatMessage"

function ChatTab() {
  return (
    <div className="flex flex-col gap-4 justify-end w-full m-4">
        <ChatMessage />
        <ChatMessage />
        <form action="" className="w-full">
            <input type="text" className="sticky border-0 w-full px-[12px] py-[8px] bg-shade-300 placeholder-text placeholder:italic rounded-[5px] focus:ring-0" placeholder="Type a message" />
        </form>
    </div>
  )
}

export default ChatTab