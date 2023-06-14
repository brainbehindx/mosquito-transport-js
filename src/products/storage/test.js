import { uploadFiles, stat, stopUpload, readFile } from "react-native-fs";
import EngineApi from "../../helpers/EngineApi";
import { getMediaType, prefixStoragePath } from "../../helpers/peripherals";
import { Scoped } from "../../helpers/variables";

export class MosquitoDbStorage {
    constructor(config) {
        this.builder = { ...config };
    }

    downloadFile(path, destination, onProgress) {

    }

    uploadFile = (file = '', destination = '', onProgress, onComplete) => {
        if (!file?.trim() || typeof file !== 'string') {
            onComplete?.({ error: 'file_path_invalid', message: `file is required in uploadFile()` });
            return;
        }
        destination = destination?.trim();

        const destErr = validateDestination(destination);

        if (destErr) {
            onComplete?.({ error: 'destination_invalid', message: destErr });
            return;
        }

        file = prefixStoragePath(file.trim());

        let hasFinished;

        const { projectUrl, accessKey } = this.builder,
            xhr = new XMLHttpRequest();

        let hasCancelled = false;

        xhr.open('POST', EngineApi._uploadFile(projectUrl), true);
        xhr.upload.addEventListener('progress', e => {
            onProgress?.({ sentBtyes: e.loaded, totalBytes: e.total });
        });
        xhr.addEventListener('load', () => {
            try {
                const result = JSON.parse(xhr.responseText);
                if (result.status === 'sucess' && result.downloadUrl) {
                    onComplete?.(undefined, result.downloadUrl);
                } else throw (result.simpleError || { error: 'unexpected_error', message: `An unexpected error occurred` });
            } catch (e) {
                onComplete?.(e);
            }
        });
        xhr.addEventListener('error', (e) => {e.
            onComplete?.({ error: 'unexpected_error', message: 'An unexpected error occurred' });
        });
        xhr.addEventListener('abort', () => {
            onComplete?.({ error: 'upload_aborted', message: 'The upload process was aborted' });
        });
        xhr.setRequestHeader('Authorization', `Bearer ${btoa(accessKey)}`);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('Content-Type', 'buffer/upload');
        if (Scoped.AuthJWTToken[projectUrl]) xhr.setRequestHeader('Mosquitodb-Token', Scoped.AuthJWTToken[projectUrl]);
        xhr.setRequestHeader('Mosquitodb-Destination', destination);

        const flingRequest = async () => {
            try {
                const fileRes = await accessFile(file);
                if (hasCancelled) return;

                xhr.setRequestHeader('Mosquitodb-Encoding', fileRes.encoding);

                console.log('flingRequest encoding:', fileRes.encoding);

                xhr.send(fileRes.txt);
            } catch (e) {
                onComplete?.({ error: 'io_failed', message: `${e}` });
            }
        }

        flingRequest();

        return () => {
            if (hasCancelled) return;
            hasCancelled = true;
            xhr.abort();
        }
    }

    deleteFile(path) {

    }

    deleteDirectory(directory) {

    }
}

const encodingList = ['utf8', 'ascii', 'base64'];

const accessFile = async (file) => {
    for (let i = 0; i < encodingList.length; i++) {
        const encoding = encodingList[i];

        try {
            const txt = await readFile(file, encoding);
            return ({ txt, encoding });
        } catch (e) {
            if (encoding === 'base64') throw e;
        }
    }
}

const validateDestination = (t = '') => {
    t = t.trim();

    if (!t || typeof t !== 'string') return `destination is required`;
    if (t.startsWith('/') || t.endsWith('/')) return 'destination must neither start with "/" nor end with "/"';
    let l = '', r;

    t.split('').forEach(e => {
        if (e === '/' && l === '/') r = 'invalid destination path, "/" cannot be side by side';
        l = e;
    });

    return r;
};