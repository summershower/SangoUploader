export interface FileItemType {
    time: number,
    id: string |number,
    directory: string,
    url?: string,
    file?: File,
    state: 'SUCCESS' | 'PENDING' | 'FAILED'
}