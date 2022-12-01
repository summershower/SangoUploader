import type { FileItemType } from "../../types"
import { useMemo } from 'react'
const Tags = ({
    filesList, activeDirectory, setActiveDirectory, setPage, setUploadDirectory
}: {
    filesList: FileItemType[],
    activeDirectory: string,
    setActiveDirectory: (directory: string) => void,
    setPage: (page: number) => void,
    setUploadDirectory: (directory: string) => void
}) => {
    // 获取所有TAG标签
    const getAllTags = useMemo(() => {
        const set: Set<string> = new Set();
        for (let i = 0; i < filesList.length; i++) {
            set.add(filesList[i].directory)
        }
        return [...set];
    }, [filesList.length])
    return (
        filesList.length ? (
            <div className='flex flex-wrap '>
                <div onClick={() => { setActiveDirectory(''); setPage(1); setUploadDirectory('test'); }} className={`mr-5 bg-gray-40 pt-4 pb-4 pl-8 pr-8 shadow-sm bg-gray-50 text-gray-800 cursor-pointer rounded-xl mt-5 transition-all hover:bg-blue-100 ${activeDirectory === '' && 'bg-blue-100'}`}>全部</div>
                {
                    getAllTags.map(directory => (
                        <div className={`mr-5 bg-gray-40 pt-4 pb-4 pl-8 pr-8 shadow-sm bg-gray-50 text-gray-800 cursor-pointer rounded-xl mt-5 transition-all hover:bg-blue-100 ${activeDirectory === directory && 'bg-blue-100'}`} key={directory} onClick={() => { setActiveDirectory(directory); setPage(1); setUploadDirectory(directory); }}>{directory}</div>
                    ))
                }
            </div>
        ) : <div></div>
    )
}
export default Tags