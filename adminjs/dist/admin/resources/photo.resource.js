import uploadFeature from "@adminjs/upload";
import { componentLoader } from "../components/component-loader.js";
import PhotoModel from "../entities/photo.entity.js";
import { LocalProvider2 } from "../providers/uploadProvider.js";
const localProvider = {
    bucket: "public/files",
    baseUrl: "/files",
    opts: {
        baseUrl: "/files",
    },
};
export const PhotoResource = {
    resource: PhotoModel,
    options: {
        editProperties: ["file", "file1", "file2", "file3", "file4", "file5"],
        actions: {
            new: { isAccessible: true },
            edit: { isAccessible: true },
            delete: { isAccessible: true },
        },
    },
    features: [
        uploadFeature({
            componentLoader,
            provider: new LocalProvider2(localProvider),
            properties: {
                key: "key",
                file: "file",
                filePath: "filePath",
                filesToDelete: "filesToDelete",
            },
        }),
        uploadFeature({
            componentLoader,
            provider: new LocalProvider2(localProvider),
            properties: {
                key: "key1",
                file: "file1",
                filePath: "filePath1",
                filesToDelete: "filesToDelete1",
            },
        }),
        uploadFeature({
            componentLoader,
            provider: new LocalProvider2(localProvider),
            properties: {
                key: "key2",
                file: "file2",
                filePath: "filePath2",
                filesToDelete: "filesToDelete2",
            },
        }),
        uploadFeature({
            componentLoader,
            provider: new LocalProvider2(localProvider),
            properties: {
                key: "key3",
                file: "file3",
                filePath: "filePath3",
                filesToDelete: "filesToDelete3",
            },
        }),
        uploadFeature({
            componentLoader,
            provider: new LocalProvider2(localProvider),
            properties: {
                key: "key4",
                file: "file4",
                filePath: "filePath4",
                filesToDelete: "filesToDelete4",
            },
        }),
        uploadFeature({
            componentLoader,
            provider: new LocalProvider2(localProvider),
            properties: {
                key: "key5",
                file: "file5",
                filePath: "filePath5",
                filesToDelete: "filesToDelete5",
            },
        }),
    ],
};
