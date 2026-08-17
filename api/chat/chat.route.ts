import { QueryClient } from "@tanstack/react-query";
import { IMessage } from "./chat.type";
import { chatQueryKeys } from "./chat.query";
import { apiClient } from "@/lib/clients/axios";
import { MessageRole, MessageStatus } from "@/prisma/generated/prisma";

interface SendMessageArgs {
  chatId: string;
  content: string;
  notebookId: string;
  queryClient: QueryClient;
  setSelectedChatId: (id: string) => void;
  setIsSending: (sending: boolean) => void;
}

export async function sendMessageRoute({
  chatId,
  content,
  notebookId,
  queryClient,
  setSelectedChatId,
  setIsSending,
}: SendMessageArgs) {
  setIsSending(true);

  const tempUserMessage: IMessage = {
    messageId: "temp-user",
    chatId: chatId,
    role: MessageRole.USER,
    status: MessageStatus.COMPLETED,
    content: content,
    createdAt: new Date(),
  };

  const cacheKey = chatQueryKeys.detail(chatId);

  // Optimistically insert user message into cache
  queryClient.setQueryData(cacheKey, (old: any) => {
    const oldMessages = old?.messages || [];
    return {
      ...old,
      chatId: chatId,
      messages: [...oldMessages, tempUserMessage],
    };
  });

  try {
    const response = await apiClient.post(
      "/api/chat",
      { chatId, content, notebookId },
      { responseType: "stream", adapter: "fetch" }
    );

    const headerChatId = response.headers["x-chat-id"];
    const currentChatId = headerChatId || chatId;

    const tempAssistantMessageId = "temp-assistant-" + Date.now();
    const tempAssistantMessage: IMessage = {
      messageId: tempAssistantMessageId,
      chatId: currentChatId,
      role: MessageRole.ASSISTANT,
      status: MessageStatus.PROCESSING,
      content: "",
      createdAt: new Date(),
    };

    const newCacheKey = chatQueryKeys.detail(currentChatId);

    queryClient.setQueryData(newCacheKey, (old: any) => {
      const oldMessages = old?.messages || [];
      const updatedMessages = oldMessages.map((m: IMessage) =>
        m.messageId === "temp-user" ? { ...m, chatId: currentChatId } : m
      );
      return {
        ...old,
        chatId: currentChatId,
        messages: [...updatedMessages, tempAssistantMessage],
      };
    });

    const reader = (response.data as ReadableStream).getReader();
    const decoder = new TextDecoder();
    let accumulatedHyde = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedHyde += chunk;

        queryClient.setQueryData(newCacheKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.map((msg: IMessage) =>
              msg.messageId === tempAssistantMessageId
                ? { ...msg, content: accumulatedHyde }
                : msg
            ),
          };
        });
      }
    }

    if (headerChatId) {
      setSelectedChatId(headerChatId);
    }

    return currentChatId;
  } finally {
    setIsSending(false);
  }
}
