import fsExtra from 'fs-extra';
import path from "path";
import { LocalProvider } from "@adminjs/upload";
import * as url from 'url';
const __dirname = path.join(url.fileURLToPath(new URL('.', import.meta.url)), '../public');
export class LocalProvider2 extends LocalProvider {
    async upload(file, key) {
        const filePath = process.platform === 'win32' ? this.path(key) : this.path(key).slice(1);
        await fsExtra.mkdir(path.dirname(filePath), { recursive: true });
        await fsExtra.move(file.path, filePath, { overwrite: true });
    }
}
