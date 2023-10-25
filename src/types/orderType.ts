import { Types } from "mongoose";
import { UserOrder } from "../classes/UserOrder";

export type TOrder = {
  messageId: number;
  userId: number;
  firstName: string;
  lastName: string;
  orderNum: string;
  closetName: string;
  comment: string;
  accepted: boolean;
  acceptedDate?: string;
  ready: boolean;
  readyDate?: string;
  file1Path: string;
  file1Name: string;
  file2Path: string;
  file2Name: string;
  dateCreated: Date;
  orderWatcherId: Types.ObjectId;
};

export type UserHashTable = {
  [key: string]: UserOrder;
};
