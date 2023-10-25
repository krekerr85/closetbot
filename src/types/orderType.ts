import { Types } from "mongoose";
import { UserOrder } from "../classes/UserOrder";

export type TOrder = {
  message_id: number;
  user_id: number;
  first_name: string;
  order_num: number;
  closet_name: string;
  comment: string;
  accepted: boolean;
  accepted_date?: string;
  ready: boolean;
  ready_date?: string;
  file1Path: string;
  file1Name: string;
  file2Path: string;
  file2Name: string;
  date_created: Date;
  order_watcher_id: Types.ObjectId;
};

export type TOrderDTO = {
    order_num: number;
    closet_name: string;
    comment: string;
    file1Path: string;
    file1Name: string;
    file2Path: string;
    file2Name: string;
    date_created: Date;
}

export type UserHashTable = {
  [key: string]: UserOrder;
};
