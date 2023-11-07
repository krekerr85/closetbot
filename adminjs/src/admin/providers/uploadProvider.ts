import fs, { existsSync } from "fs";
import fsExtra from 'fs-extra';
import path from "path";
import { UploadedFile } from "adminjs";
import { BaseProvider, LocalProvider } from "@adminjs/upload";
import * as url from 'url'
const __dirname = path.join(url.fileURLToPath(new URL('.', import.meta.url)), '../public')
export  class LocalProvider2 extends LocalProvider {

  // * Fixed this method because original does rename instead of move and it doesn't work with docker volume
  public async upload(file: UploadedFile, key: string): Promise<any> {
    const filePath = process.platform === 'win32' ? this.path(key) : this.path(key).slice(1); // adjusting file path according to OS
    await fsExtra.mkdir(path.dirname(filePath), {recursive: true});
    await fsExtra.move(file.path, filePath, {overwrite: true});
  }

}