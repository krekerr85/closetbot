export type TUser = {
  userId: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  dateMessage?: number;
  dateCreated?: Date;
};
