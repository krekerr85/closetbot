import { Mongoose } from 'mongoose';
export declare const connect: (uri: string, dbSetting: {
    [key: string]: any;
}) => Promise<Mongoose>;
export declare const DatabaseURI = "mongodb://closetbot:closetbot@localhost:20000/closetbot?directConnection=true";
