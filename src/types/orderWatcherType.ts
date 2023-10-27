import { OrderMessageT } from "./orderType";

export type OrderWatcherT = {
  closet_name: string,
  user_id: number;
  first_name: string;
  last_name?: string;
  message_id: number;
  date_created: Date;
  sawingMessage: OrderMessageT,
  doorMessage: OrderMessageT,
};
