export interface Conversation {
  id: string;
  messagingService: string;
  chatService: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  index: number;
  body: string;
  author: string;
  media: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  messages: Message[];
  agent: string;
  client: string;
  state: string;
}
