import { UploadedFile } from "adminjs";
import { LocalProvider } from "@adminjs/upload";
export declare class LocalProvider2 extends LocalProvider {
    upload(file: UploadedFile, key: string): Promise<any>;
}
