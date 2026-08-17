import { MessageRole, MessageStatus } from "@/prisma/generated/prisma";

export interface IMessage {
  messageId: string;
  chatId: string;
  role: MessageRole;
  status: MessageStatus;
  content: string | null;
  createdAt: Date;
}

export interface IChatDetails {
  chatId: string;
  title: string;
  messages: IMessage[];
}
