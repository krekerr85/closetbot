import { Types } from "mongoose";
import { PopulatedDoc } from 'mongoose';

export type TelegramMessageT = {
  message_id: number;
  user_id: number;
}

export type OrderT = {
  _id: Types.ObjectId;
  messages: TelegramMessageT[];
  order: OrderDTO;
  title: string
  date_created: Date;
  order_num: number;
  status: string;
  price: number;
  priceLey: string;
  addInfo: string;
};

export type SubOrderT = {
  _id: Types.ObjectId;
  message_id: number;
  user_id: number;
  accepted_date?: Date | null;
  ready_date?: Date | null;
  order_type: string;
  order_id: Types.ObjectId;
} ;

export type OrderDTO = {
  size: string;
  color: string;
  comment: string;
  door_type: string;
};

export type OrderMessageT = {
  userType: string;
  accepted?: string;
  ready?: string;
};
