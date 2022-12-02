

const storeName = 'uploadRecords', dbName = 'SangoUploader', version = 2;
let db: any = null;
import type { FileItemType } from "@/pages/UploadPage/types";

export function useDB() {
    return new Promise((resolve, reject) => {
        const req = window.indexedDB.open(dbName, version);
        // 创建、升级版本事件，重新获取DB
        req.onupgradeneeded = (event) => {
            db = (event?.target as any)?.result;
            if (!db.objectStoreNames.contains(storeName)) {
                // 创建uploadRecords表格，表格使用自增主键
                const objectStore = db.createObjectStore(storeName, {
                    keyPath: 'id'
                });
            }
        }
        // 连接成功
        req.onsuccess = (event) => {
            db = (event?.target as any)?.result;
            resolve(true);
        }
        req.onerror = (event) => {
            reject(event);
        }
    })
}
export function addLog(fileItem: FileItemType): void {
    delete fileItem.file;
    const request = db.transaction(storeName, 'readwrite').objectStore(storeName).add(fileItem)
    request.onsuccess = () => {
        console.log('写入', request.result);
    }
    request.onerror = (event) => {
        console.log(event, '写入失败');
    }
}
export function readLog() {
    return new Promise((resolve, reject) => {
        const objStore = db.transaction(storeName).objectStore(storeName);
        const req = objStore.getAll();
        req.onsuccess = (r) => {
            resolve(r.target.result)
        }

    })
}
export function delLog(id: number): void {
    const request = db.transaction(storeName, 'readwrite').objectStore(storeName).delete(id);
    request.onsuccess = () => {
        console.log('删除成功', request.result);
    }
    request.onerror = (event) => {
        console.log(event, '删除失败');
    }
}