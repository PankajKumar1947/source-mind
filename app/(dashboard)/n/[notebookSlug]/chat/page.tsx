"use client"

import * as React from "react"
import { Plus, Send, Loader2, MessageSquare, AlertCircle } from "lucide-react"
import { useNotebook } from "@/context/notebook-context"
import { getChatsByNotebookId, getChatById } from "@/services/chat.service"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Message {
  messageId: string
  chatId: string
  role: "USER" | "ASSISTANT" | "SYSTEM" | "TOOL"
  status: "PROCESSING" | "COMPLETED" | "FAILED"
  content: string | null
  createdAt: Date
}

interface ChatDetails {
  chatId: string
  title: string
  messages: Message[]
}

export default function ChatPage() {
  const { activeNotebook, isLoading: notebookLoading } = useNotebook()
  const [chats, setChats] = React.useState<any[]>([])
  const [selectedChatId, setSelectedChatId] = React.useState<string | "new">("new")
  const [activeChat, setActiveChat] = React.useState<ChatDetails | null>(null)

  const [input, setInput] = React.useState("")
  const [isLoadingChats, setIsLoadingChats] = React.useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Fetch chats for the current notebook
  const fetchChats = React.useCallback(async (notebookId: string) => {
    setIsLoadingChats(true)
    try {
      const data = await getChatsByNotebookId(notebookId)
      setChats(data)
    } catch (error) {
      console.error("Error loading chats:", error)
      toast.error("Failed to load chats")
    } finally {
      setIsLoadingChats(false)
    }
  }, [])

  // Load chats on notebook load
  React.useEffect(() => {
    if (activeNotebook?.notebookId) {
      fetchChats(activeNotebook.notebookId)
    }
  }, [activeNotebook?.notebookId, fetchChats])

  // Fetch messages when selected chat changes
  React.useEffect(() => {
    if (selectedChatId === "new") {
      setActiveChat(null)
      return
    }

    const loadChatDetails = async () => {
      // Avoid flashing the spinner if we already have this chat's messages in state (e.g. just finished streaming)
      const isAlreadyLoaded = activeChat && activeChat.chatId === selectedChatId;
      if (!isAlreadyLoaded) {
        setIsLoadingMessages(true);
      }
      try {
        const data = await getChatById(selectedChatId)
        if (data) {
          // Sort messages ascending by createdAt
          const sortedMessages = [...(data.messages || [])].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          setActiveChat({
            ...data,
            messages: sortedMessages as Message[],
          })
        }
      } catch (error) {
        console.error("Error loading chat:", error)
        toast.error("Failed to load chat messages")
      } finally {
        setIsLoadingMessages(false)
      }
    }

    loadChatDetails()
  }, [selectedChatId])

  // Poll for message updates if there is a message currently in PROCESSING status
  React.useEffect(() => {
    if (selectedChatId === "new" || !activeChat) return;

    const hasProcessing = activeChat.messages.some((msg) => msg.status === "PROCESSING");
    if (!hasProcessing) return;

    const intervalId = setInterval(async () => {
      try {
        const data = await getChatById(selectedChatId);
        if (data) {
          const sortedMessages = [...(data.messages || [])].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setActiveChat({
            ...data,
            messages: sortedMessages as Message[],
          });
        }
      } catch (error) {
        console.error("Error polling chat:", error);
      }
    }, 1500);

    return () => clearInterval(intervalId);
  }, [selectedChatId, activeChat?.messages.map(m => m.status).join(",")]);

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
    setIsSending(true)

    // Add optimistic user message to UI
    const tempUserMessage: Message = {
      messageId: "temp-user",
      chatId: selectedChatId,
      role: "USER",
      status: "COMPLETED",
      content: messageContent,
      createdAt: new Date(),
    }

    if (activeChat) {
      setActiveChat((prev) =>
        prev
          ? {
            ...prev,
            messages: [...prev.messages, tempUserMessage],
          }
          : null
      )
    } else {
      setActiveChat({
        chatId: "new",
        title: messageContent.substring(0, 15),
        messages: [tempUserMessage],
      })
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: selectedChatId,
          content: messageContent,
          notebookId: activeNotebook.notebookId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message and start stream");
      }

      const headerChatId = response.headers.get("x-chat-id");
      const currentChatId = headerChatId || selectedChatId;

      // Add placeholder assistant message to render incoming hyde stream
      const tempAssistantMessageId = "temp-assistant-" + Date.now();
      const tempAssistantMessage: Message = {
        messageId: tempAssistantMessageId,
        chatId: currentChatId,
        role: "ASSISTANT",
        status: "PROCESSING",
        content: "",
        createdAt: new Date(),
      };

      setActiveChat((prev) => {
        if (!prev) return null;
        const updatedMessages = prev.messages.map((m) =>
          m.messageId === "temp-user" ? { ...m, chatId: currentChatId } : m
        );
        return {
          ...prev,
          chatId: currentChatId,
          messages: [...updatedMessages, tempAssistantMessage],
        };
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedHyde = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedHyde += chunk;

          // Update state chunk-by-chunk for live streaming preview
          setActiveChat((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.messageId === tempAssistantMessageId
                  ? { ...msg, content: accumulatedHyde }
                  : msg
              ),
            };
          });
        }
      }

      await fetchChats(activeNotebook.notebookId);

      if (headerChatId) {
        setSelectedChatId(headerChatId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred while sending the message");
      setIsSending(false);
    } finally {
      setIsSending(false);
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
