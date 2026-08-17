import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IChatDetails } from "@/api/chat/chat.type";
import { chatQueryKeys } from "@/api/chat/chat.query";
import { getChatsByNotebookId, getChatById } from "@/lib/data/chat";
import { sendMessageRoute } from "@/api/chat/chat.route";

export function useChat(notebookId: string, selectedChatId: string, setSelectedChatId: (id: string) => void) {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);

  // 1. Fetch Chats List
  const { data: chats = [], isLoading: isLoadingChats } = useQuery({
    queryKey: chatQueryKeys.list(notebookId),
    queryFn: () => getChatsByNotebookId(notebookId),
    enabled: !!notebookId,
  });

  // 2. Fetch Active Chat Details
  const { data: activeChat, isLoading: isLoadingMessages } = useQuery<IChatDetails | null>({
    queryKey: chatQueryKeys.detail(selectedChatId),
    queryFn: async () => {
      const data = await getChatById(selectedChatId);
      return data as IChatDetails | null;
    },
    enabled: !!selectedChatId && selectedChatId !== "new",
    refetchInterval: (query) => {
      const chat = query.state.data as IChatDetails | null;
      const hasProcessing = chat?.messages?.some((msg) => msg.status === "PROCESSING");
      return hasProcessing ? 1500 : false;
    },
  });

  // 3. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      sendMessageRoute({
        chatId: selectedChatId,
        content,
        notebookId,
        queryClient,
        setSelectedChatId,
        setIsSending,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.list(notebookId) });
    },
  });

  return {
    chats,
    isLoadingChats,
    activeChat,
    isLoadingMessages,
    isSending,
    sendMessage: sendMessageMutation.mutateAsync,
  };
}
