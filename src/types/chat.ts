export interface Chat {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  archived: boolean;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  is_user: boolean;
  created_at: string;
}