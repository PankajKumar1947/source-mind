"use client"

import * as React from "react"
import { Plus, Send, Loader2, MessageSquare } from "lucide-react"
import { useNotebook } from "@/components/providers/notebook-provider"
import { useChat } from "@/hooks/use-chat"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function ChatPage() {
  const { activeNotebook, isLoading: notebookLoading } = useNotebook()
  const [selectedChatId, setSelectedChatId] = React.useState<string | "new">("new")
  const [input, setInput] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const {
    chats,
    isLoadingChats,
    activeChat,
    isLoadingMessages,
    isSending,
    sendMessage,
  } = useChat(activeNotebook?.notebookId || "", selectedChatId, setSelectedChatId);

  // Scroll to bottom of message list
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChat?.messages, isSending])

  // Handle message send
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !activeNotebook) return

    const messageContent = input.trim()
    setInput("")

    try {
      await sendMessage(messageContent);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred while sending the message");
    }
  }

  if (notebookLoading || !activeNotebook) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-border bg-card overflow-hidden">
      {/* Chats Sidebar */}
      <div className="w-80 border-r border-border flex flex-col bg-muted/30">
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
          <h2 className="font-semibold text-sm">Chats</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedChatId("new")}
            className="h-8 w-8 p-0"
            title="Start new chat"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            onClick={() => setSelectedChatId("new")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors",
              selectedChatId === "new"
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>New Chat</span>
          </button>

          {isLoadingChats ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.chatId}
                onClick={() => setSelectedChatId(chat.chatId)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors truncate",
                  selectedChatId === chat.chatId
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-accent hover:text-accent-foreground text-foreground"
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Workspace Header */}
        <div className="px-6 py-4 border-b border-border flex items-center bg-card">
          <h2 className="font-semibold">
            {selectedChatId === "new" ? "New Chat" : activeChat?.title || "Loading Chat..."}
          </h2>
        </div>

        {/* Message Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !activeChat || activeChat.messages.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center text-center p-8 text-muted-foreground max-w-md mx-auto space-y-3">
              <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
              <h3 className="font-medium text-foreground">Ask anything about your notebook</h3>
              <p className="text-xs">
                Your AI assistant will search through the sources added to {activeNotebook.title} to answer your questions.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activeChat.messages
                .filter((message) => !(message.status === "PROCESSING" && !message.content))
                .map((message) => (
                  <div
                    key={message.messageId}
                    className={cn(
                      "flex w-full",
                      message.role === "USER" ? "justify-end" : "justify-start"
                    )}
                  >
                    <Bubble
                      variant={message.role === "USER" ? "default" : "muted"}
                      align={message.role === "USER" ? "end" : "start"}
                    >
                      <BubbleContent className="whitespace-pre-wrap">
                        {message.content}
                        {message.status === "PROCESSING" && (
                          <span className="block mt-2 text-[10px] text-muted-foreground/60 italic flex items-center gap-1.5 border-t border-border/30 pt-1.5">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            Draft preview... Synthesizing final response...
                          </span>
                        )}
                      </BubbleContent>
                    </Bubble>
                  </div>
                ))}

              {(isSending || activeChat.messages.some((msg) => msg.status === "PROCESSING" && !msg.content)) && (
                <div className="flex w-full justify-start">
                  <Bubble variant="muted" align="start">
                    <BubbleContent className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Synthesizing answer...</span>
                    </BubbleContent>
                  </Bubble>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border bg-card">
          <form onSubmit={handleSend} className="flex gap-2 max-w-3xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isSending || isLoadingMessages}
              className="flex-1"
              autoFocus
            />
            <Button type="submit" disabled={isSending || !input.trim() || isLoadingMessages}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
