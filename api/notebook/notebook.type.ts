import { ISource } from "@/api/source/source.type";

export interface IChat {
  chatId: string;
  title: string;
  createdAt: Date;
}

export interface INotebook {
  notebookId: string;
  title: string;
  sources: ISource[];
  chats: IChat[];
  userId: string;
  createdAt: Date;
}
