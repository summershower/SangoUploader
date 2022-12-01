import ICON_FILE from '@/assets/images/file.png'
import { handleCopy } from '@/utils';
import dayjs from 'dayjs';
import { delLog } from '@/utils/IndexDB';
const relativeTime = require('dayjs/plugin/relativeTime')
import zh from 'dayjs/locale/zh';
dayjs.extend(relativeTime).locale(zh);


export default function FileItem({ url, state, file, index, time, setFilesList }: { url?: string, state: 'SUCCESS' | 'PENDING' | 'FAILED', file?: File, index: number, time: number, setFilesList: Function }) {
    const animationDelay = () => {
        return {
            animationDelay: index * 0.05 + 's'
        }
    }

    function del() {
        // delLog();
    }

    return state === 'PENDING' ?
        (<div className="flipAnimation flex p-3 mt-6 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all cursor-pointer" style={animationDelay()}>
            <img className="rounded-xl w-24 h-24 object-cover filter blur-sm  " src={/png|jpg|jpeg|png|webp|bmp|svg/i.test(url ?? '') ? URL.createObjectURL(file as File) : ICON_FILE} />
            <div className="flex-1 flex items-center ml-4 break-all">上传中...</div>
        </div>) : state === 'SUCCESS' ?
            (
                <div className="flipAnimation relative flex p-3 mt-6 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all cursor-pointer" onClick={() => handleCopy(url ?? '')} style={animationDelay()}>
                    <img className="rounded-xl w-24 h-24 object-cover" src={/png|jpg|jpeg|png|webp|bmp|svg/i.test(url || '') ? url : ICON_FILE} />
                    <div className='flex-1 flex flex-col justify-center items-start h-24 ml-4 '>
                        <div>{url} </div>
                        <div className="text-xs text-gray-400 mt-2">上传时间：{dayjs(time).format('YYYY-MM-DD HH:mm:ss')} ({dayjs(time).fromNow()})</div>
                    </div>
                    <div className="absolute right-4 top-4 rounded-full bg-gray-400 transition-all w-6 h-6 text-white flex justify-center items-center hover:bg-gray-500">X</div>
                </div>
            ) :
            (<div className="flipAnimation flex p-3 mt-6 bg-red-100 rounded-xl hover:bg-gray-300 transition-all cursor-pointer" style={animationDelay()}>
                <img className="rounded-xl w-24 h-24 object-cover filter blur-sm " src={/png|jpg|jpeg|png|webp|bmp|svg/i.test(url ?? '') ? URL.createObjectURL(file as File) : ICON_FILE} />
                <div className="flex-1 flex items-center ml-4 break-all">上传失败</div>
            </div>)
}