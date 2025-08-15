export enum MessageSender {
  CLIENT = "client",
  AVATAR = "avatar",
}

export interface Message {
  id: string;
  content: string;
  sender: MessageSender;
}
