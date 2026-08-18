import { MessageRole, MessageStatus, SourceType } from "@/prisma/generated/prisma";

export interface ICitationSource {
  sourceId: string;
  title: string | null;
  sourceType: SourceType;
  url: string | null;
}

export interface ICitation {
  citationId: string;
  messageId: string;
  sourceId: string;
  pageNumber: number | null;
  content: string;
  source: ICitationSource;
}

export interface IMessage {
  messageId: string;
  chatId: string;
  role: MessageRole;
  status: MessageStatus;
  content: string | null;
  createdAt: Date;
  citations?: ICitation[];
}

export interface IChatDetails {
  chatId: string;
  title: string;
  messages: IMessage[];
}
