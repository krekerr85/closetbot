import { Types } from "mongoose";


export type OrderT = {
  message_id: number;
  user_id: number;
  order_num?: number;
  closet_name: string;
  comment?: string;
  accepted_date?: Date | null;
  ready_date?: Date | null;
  order_type: string;
  file1_path: string;
  file1_name: string;
  file2_path: string;
  file2_name: string;
  date_created: Date;
  order_watcher_id: Types.ObjectId;
};

export type OrderDTO = {
    order_num: number;
    closet_name: string;
    comment: string;
    file1_path: string;
    file1_name: string;
    file2_path: string;
    file2_name: string;
    date_created: Date;
}



export type OrderMessageT = {
    title: string;
    userType: string;
    accepted?: string;
    ready?: string;
  };
