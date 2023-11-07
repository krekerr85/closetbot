import mongoose, { Mongoose } from 'mongoose';

export const connect = (
  uri: string,
  dbSetting: { [key: string]: any },
): Promise<Mongoose> => {
  return mongoose.connect(uri, dbSetting);
};

export const DatabaseURI = "mongodb://closetbot:closetbot@localhost:17017/closetbot";
