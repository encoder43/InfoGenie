// frontend/src/App.tsx (Corrected Version)
import { useState, useRef, useEffect } from "react";
import { UploadSection } from "./components/UploadSection";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
// import { ScrollArea } from "./components/ui/scroll-area"; // Removed - using native scrolling
import { FileText, Sparkles } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUploadedPdf, setHasUploadedPdf] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleUploadSuccess = (filename: string) => {
    setHasUploadedPdf(true);
    setMessages([
      {
        id: Date.now().toString(),
        text: `Great! I've loaded "${filename}". You can now ask me questions about this document.`,
        isUser: false,
        timestamp: formatTime(),
      },
    ]);
  };

  const handleSendMessage = async (messageText: string) => {
    if (!hasUploadedPdf) {
      setMessages([
        {
          id: Date.now().toString(),
          text: "Please upload a PDF file first before asking questions.",
          isUser: false,
          timestamp: formatTime(),
        },
      ]);
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: formatTime(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add typing indicator
    const typingId = (Date.now() + 1).toString();
    const typingMessage: Message = {
      id: typingId,
      text: "Thinking...",
      isUser: false,
      timestamp: formatTime(),
    };
    setMessages((prev) => [...prev, typingMessage]);

    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: messageText }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Remove typing indicator and add actual response
        setMessages((prev) => {
          const withoutTyping = prev.filter((msg) => msg.id !== typingId);
          return [
            ...withoutTyping,
            {
              id: Date.now().toString(),
              text: data.answer || data.response || "I couldn't find an answer to that question.",
              isUser: false,
              timestamp: formatTime(),
            },
          ];
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get response");
      }
    } catch (error) {
      // Remove typing indicator and add error message
      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => msg.id !== typingId);
        return [
          ...withoutTyping,
          {
            id: Date.now().toString(),
            text:
              error instanceof Error
                ? `Error: ${error.message}`
                : "Sorry, I couldn't process your question. Please make sure the backend is running.",
            isUser: false,
            timestamp: formatTime(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-foreground/10 p-2 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-primary-foreground">InfoGenie</h1>
              <p className="text-xs text-primary-foreground/70">
                Upload a PDF and ask questions about its content
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col max-w-7xl w-full mx-auto p-4 gap-4">
        {/* Upload Section - Compact when file is uploaded */}
        <div className={`transition-all duration-500 ease-in-out ${hasUploadedPdf ? 'h-24 flex-shrink-0' : 'h-auto'}`}>
          <UploadSection onUploadSuccess={handleUploadSuccess} isCompact={hasUploadedPdf} />
        </div>

        {/* Chat Section - Takes most of the space when file is uploaded */}
        <div className={`flex-1 flex flex-col bg-card rounded-lg border border-border shadow-sm overflow-hidden transition-all duration-500 ease-in-out ${hasUploadedPdf ? 'min-h-[calc(100vh-200px)]' : 'min-h-[500px]'}`}>
          <div className="p-4 border-b border-border bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-semibold">Conversation</h3>
              {hasUploadedPdf && (
                <div className="ml-auto text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
                  PDF Ready - Ask Questions
                </div>
              )}
            </div>
          </div>

          <div 
            ref={scrollAreaRef} 
            className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 min-h-0"
            style={{ 
              maxHeight: hasUploadedPdf ? 'calc(100vh - 180px)' : 'calc(100vh - 300px)',
              minHeight: hasUploadedPdf ? 'calc(100vh - 180px)' : '400px'
            }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
                <div className="bg-muted/50 p-6 rounded-full mb-4">
                  <FileText className="w-12 h-12" />
                </div>
                <h3 className="text-foreground mb-2">No messages yet</h3>
                <p className="max-w-sm">
                  Upload a PDF document and start asking questions to get insights from your document.
                </p>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto space-y-8">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg.text}
                    isUser={msg.isUser}
                    timestamp={msg.timestamp}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading || !hasUploadedPdf}
            />
          </div>
        </div>
      </div>
    </div>
  );
}