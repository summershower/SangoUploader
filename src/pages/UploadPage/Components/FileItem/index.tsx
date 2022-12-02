import ICON_FILE from '@/assets/images/file.png'
import { handleCopy } from '@/utils';
import dayjs from 'dayjs';
import { delLog } from '@/utils/IndexDB';
import { useRef, useEffect, EventHandler } from 'react';
import type { FileItemType } from '../../types';
import type { MouseEvent } from 'react';
import './index.less'
const relativeTime = require('dayjs/plugin/relativeTime')
import zh from 'dayjs/locale/zh';
dayjs.extend(relativeTime).locale(zh);


export default function FileItem({ url, state, file, time, size, id, setFilesList }: { url?: string, state: 'SUCCESS' | 'PENDING' | 'FAILED', file?: File, time: number, size: number, id: number, setFilesList: Function }) {
    const fileItemRef = useRef<any>(null);
    useEffect(() => {
        const io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fileItemRef.current?.classList.add('flipAnimation');
                io.disconnect();
            }
        })
        io.observe((fileItemRef.current) as HTMLElement);
    }, [fileItemRef.current])

    function handleDelete(e: MouseEvent) {
        e.stopPropagation();
        setFilesList((pre: FileItemType[]) => pre.filter(v => v.id !== id));
        delLog(id);
    }

    return state === 'PENDING' ?
        (<div className="file-item flex p-3 mt-6 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all cursor-pointer" ref={fileItemRef}>
            <img className="rounded-xl w-24 h-24 object-cover filter blur-sm  " src={/png|jpg|jpeg|png|webp|bmp|svg/i.test(url ?? '') ? URL.createObjectURL(file as File) : ICON_FILE} />
            <div className="flex-1 flex items-center ml-4 break-all">上传中...</div>
        </div>) : state === 'SUCCESS' ?
            (
                <div className="file-item  relative flex p-3 mt-6 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all cursor-pointer" onClick={() => handleCopy(url ?? '')} ref={fileItemRef}>
                    <img className="rounded-xl w-24 h-24 object-cover" src={/png|jpg|jpeg|png|webp|bmp|svg/i.test(url || '') ? url : ICON_FILE} />
                    <div className='flex-1 flex flex-col justify-center items-start h-24 ml-4 '>
                        <div>{url} </div>
                        <div className="text-xs text-gray-400 mt-2">文件大小: {size / 1024 > 1024 ? (size / 1024 / 1024).toFixed(2) + 'Mb' : (size / 1024).toFixed(2) + 'kb'}&nbsp;&nbsp;&nbsp;上传时间：{dayjs(time).format('YYYY-MM-DD HH:mm:ss')} ({dayjs(time).fromNow()})</div>
                    </div>
                    <div className="closeBtn hidden absolute right-3 top-3 text-sm rounded-full bg-gray-400 transition-all w-5 h-5 text-white flex justify-center items-center hover:bg-red-400" onClick={handleDelete}>X</div>
                </div>
            ) :
            (<div className="file-item flex p-3 mt-6 bg-red-100 rounded-xl hover:bg-gray-300 transition-all cursor-pointer" ref={fileItemRef}>
                <img className="rounded-xl w-24 h-24 object-cover filter blur-sm " src={/png|jpg|jpeg|png|webp|bmp|svg/i.test(url ?? '') ? URL.createObjectURL(file as File) : ICON_FILE} />
                <div className="flex-1 flex items-center ml-4 break-all">上传失败</div>
            </div>)
}