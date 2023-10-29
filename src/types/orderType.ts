import { Types } from "mongoose";


export type OrderT = {
  message_id: number;
  user_id: number;
  order: OrderDTO;
  title: string;
};

export type SubOrderT = {
  message_id: number;
  user_id: number;
  accepted_date?: Date | null;
  ready_date?: Date | null;
  order_type: string;
  order_id: Types.ObjectId;
};

export type OrderDTO = {
  order_num: number;
  size: string;
  color: string,
  comment: string;
  door_type: string;
}


export type OrderMessageT = {
    userType: string;
    accepted?: string;
    ready?: string;
  };
