import { UserOrder } from "../classes/Order";

export type TOrder = {
  orderId: number;
  id: number;
  firstName: string;
  lastName: string;
  orderNum: string;
  closetName: string;
  comment: string;
  accepted: boolean;
  ready: boolean;
  file1Path: string;
  file1Name: string;
  file2Path: string;
  file2Name: string;
  dateCreated: Date;
};

export type UserHashTable = {
  [key: string]: UserOrder;
};
