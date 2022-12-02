import type { FileItemType } from "../../types"
import { useMemo, useState, useEffect, type MouseEvent } from 'react'
import type { TagType } from './types'
import './index.less'
import { delLog } from "@/utils/IndexDB"
import { message, Popconfirm } from 'antd';
const Tags = ({
    filesList, activeDirectory, setActiveDirectory, setPage, setUploadDirectory, setFilesList
}: {
    filesList: FileItemType[],
    activeDirectory: string,
    setActiveDirectory: (directory: string) => void,
    setPage: (page: number) => void,
    setUploadDirectory: (directory: string) => void
    setFilesList: (files: FileItemType[]) => void
}) => {

    // 统计TAG数量
    const [tags, setTags] = useState<Record<string, TagType>>({});
    useEffect(() => {
        const record: Record<string, TagType> = {};
        for (let i = 0; i < filesList.length; i++) {
            if (record[filesList[i].directory]) {
                record[filesList[i].directory]['count']++;
                if (
                    record[filesList[i].directory]['lastModified'] < filesList[i].time
                ) {
                    record[filesList[i].directory]['lastModified'] = filesList[i].time;
                }
            } else {
                record[filesList[i].directory] = {
                    count: 1,
                    lastModified: filesList[i].time,
                    directory: filesList[i].directory
                };
            }
            setTags(record);
        }
    }, [filesList.length])

    function handleDelete(directory: string, e: MouseEvent) {
        e.stopPropagation();
        const filesListCopy = [...filesList];
        for (let i = 0; i < filesList.length; i++) {
            if (filesList[i].directory === directory) {
                delLog(filesList[i].id);
                const index = filesListCopy.findIndex(v => v.id === filesList[i].id);
                filesListCopy.splice(index, 1);
            }
        }
        setFilesList(filesListCopy);
        setActiveDirectory('');
        setPage(1);
    }
    return (
        filesList.length ? (
            <div className='flex flex-wrap'>
                <div onClick={() => { setActiveDirectory(''); setPage(1); setUploadDirectory('test'); }} className={`mr-5 bg-gray-40 pt-4 pb-4 pl-8 pr-8 shadow-sm bg-gray-50 text-gray-800 cursor-pointer rounded-xl mt-5 transition-all hover:bg-blue-100 ${activeDirectory === '' && 'bg-blue-100'}`}>全部({filesList.length})</div>
                {
                    Object.entries(tags).sort((a, b) => b[1].lastModified - a[1].lastModified).map(([directory, value]) => (

                        <div className={`tag-item relative mr-5 bg-gray-40 pt-4 pb-4 pl-8 pr-8 shadow-sm bg-gray-50 text-gray-800 cursor-pointer rounded-xl mt-5 transition-all hover:bg-blue-100 ${activeDirectory === directory && 'bg-blue-100'}`} key={directory} onClick={() => { setActiveDirectory(directory); setPage(1); setUploadDirectory(directory); }}>{directory}({value.count})
                            <Popconfirm
                                title={`删除${directory}的记录吗？`}
                                onConfirm={(e) => handleDelete(directory, e)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <div className="tagCloseBtn absolute text-xs rounded-full bg-gray-300 transition-all w-5 h-5 text-white flex justify-center items-center hover:bg-red-400 hover:w-6 hover:h-6">X</div>
                            </Popconfirm>
                        </div>
                    ))
                }
            </div>
        ) : <div></div>
    )
}
export default Tags