import mongoose, { Mongoose } from 'mongoose';

export const connect = (
  uri: string,
  dbSetting: { [key: string]: any },
): Promise<Mongoose> => {
  return mongoose.connect(uri, dbSetting);
};

export const DatabaseURI = "mongodb://closetbot:closetbot@localhost:20000/closetbot?directConnection=true";
