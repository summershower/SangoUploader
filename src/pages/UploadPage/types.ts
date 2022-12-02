export interface FileItemType {
    time: number,
    id: number,
    directory: string,
    size: number,
    url?: string,
    file?: File,
    state: 'SUCCESS' | 'PENDING' | 'FAILED'
}