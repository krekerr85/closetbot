import mongoose from 'mongoose';
export const connect = (uri, dbSetting) => {
    return mongoose.connect(uri, dbSetting);
};
export const DatabaseURI = "mongodb://closetbot:closetbot@localhost:20000/closetbot?directConnection=true";
