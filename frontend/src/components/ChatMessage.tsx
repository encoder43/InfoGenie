import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: string;
}

export function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div
      className={`flex gap-6 mb-8 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isUser ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </div>

      <div className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-6 py-4 rounded-2xl shadow-sm ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-secondary text-secondary-foreground rounded-tl-sm"
          }`}
        >
          <p className="break-words whitespace-pre-wrap text-base leading-relaxed font-medium">
            {message}
          </p>
        </div>
        <span className="text-xs text-muted-foreground mt-3 px-2 font-medium">
          {timestamp}
        </span>
      </div>
    </div>
  );
}
