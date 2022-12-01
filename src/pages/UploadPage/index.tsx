import { useState, useEffect, useRef } from 'react';
import Options from './Components/Options'
import FileItem from './Components/FileItem'
import { OSS } from '@/utils/OSS'
import { useDB, readLog, addLog } from '@/utils/IndexDB'
import type { FileItemType, } from './types'
import { message, Pagination, Progress } from 'antd'
import { getHashName, PromisePool } from '@/utils'
import './index.css'
import Tags from './Components/Tags';

let ossObject = new OSS();
let ossInstance: any // OSS对象实例

export default function Upload() {
    // 初始化OSS实例设置
    async function initOSS() {
        try {
            ossInstance = await ossObject.getOSS()
            setInitState('FINISHED')
        } catch (e) {
            setInitState('ERROR')
        }

    }
    // 获取IndexDB中的历史数据
    useEffect(() => {
        initOSS()
        useDB().then(() => {
            readLog().then((res: any) => {
                setFilesList(res);
            })
        })
    }, [])

    const [uploadDirectory, setUploadDirectory] = useState('test');
    const [isNeedHash, setIsNeedHash] = useState(true);

    // 状态组件
    const [initState, setInitState] = useState('LOADING')
    const State = () => {
        switch (initState) {
            case 'LOADING':
                return (
                    <h1 className="text-xl text-gray-400">正在加载OSS组件...</h1>
                )
            case 'FINISHED':
                return (
                    <h1 className="text-xl text-green-600">OSS初始化完毕✔</h1>
                )
            case 'ERROR':
                return (
                    <h1 className="text-xl text-pink-600 cursor-pointer" onClick={() => location.reload()}>初始化失败，点击重试×</h1>
                )
        }
    }

    const [isUploading, setIsUploading] = useState<boolean>(false); // 上传状态标记
    const [filesList, setFilesList] = useState<FileItemType[]>([]); // 文件列表
    const [uploadPercentage, setUploadPercentage] = useState(0);
    const [messageApi, contextHolder] = message.useMessage();
    const isUploadingRef = useRef(isUploading);
    useEffect(() => {
        isUploadingRef.current = isUploading;
    }, [isUploading])

    useEffect(() => {
        console.log(isUploading);
    })
    // 选择文件完毕，开始上传
    function handleUploadEvent(e: any) {
        setIsUploading(true);

        const promises: (() => Promise<any>)[] = [];
        for (let i = 0; i < e.target.files.length; i++) {
            promises.push(() => uploadToOSS(e.target.files[i], Math.floor(Math.random() * 10000000000000000), uploadDirectory));
        }
        const PP = new PromisePool(promises, 10, (state: string, processing: number, rest: number, failed: number, total: number) => {
            setUploadPercentage(Math.floor((total - rest - processing) / total * 100));
            if ((state === 'FAILED' || state === 'SUCCESS') && isUploadingRef) {
                console.log(state, processing, rest, failed, total);
                if (failed === 0) {
                    messageApi.open({
                        type: 'success',
                        content: `成功上传${total}个文件`,
                    });
                } else if (total > failed) {
                    messageApi.open({
                        type: 'warning',
                        content: `成功上传${total - failed}个文件，失败${failed}个`,
                    });
                } else {
                    messageApi.open({
                        type: 'error',
                        content: `${failed}个文件上传失败`,
                    });
                }
                setIsUploading(false);
            }

        });
        PP.start();

    }

    const filesListRef = useRef(filesList);
    useEffect(() => {
        filesListRef.current = filesList;
    }, [filesList])

    // 上传到OSS
    async function uploadToOSS(file: File, id: string | number, directory: string) {
        try {
            // 获取哈希文件名
            let filename
            if (isNeedHash) {
                filename = await getHashName(file);
            } else {
                filename = file.name
            }

            // 添加到UI
            const newFileItem: FileItemType = {
                time: +new Date(),
                id: id,
                file: file,
                size: file.size,
                state: 'PENDING',
                directory: directory
            };
            setFilesList(pre => [
                newFileItem,
                ...pre
            ])

            // 开始上传
            const res = await ossInstance.put(`/web/${uploadDirectory ? uploadDirectory + '/' : ''}` + filename, file)
            const url = 'https://cdn.meiqijiacheng.com/' + res.name;

            const afterFiles = [...filesListRef.current];
            const targetFile = afterFiles.find(v => v.id === id);

            (targetFile as FileItemType).state = 'SUCCESS';
            (targetFile as FileItemType).url = url;

            setFilesList([
                ...afterFiles
            ])
            setActiveDirectory(uploadDirectory);

            // 添加到IndexDB
            addLog(targetFile as FileItemType);


        } catch (e: any) {
            // 更改对应UI状态
            let files: FileItemType[] = [...filesListRef.current];

            const targetFile = files.find(v => v.id === id);
            (targetFile as FileItemType).state = 'FAILED';

            setFilesList(files)
            throw new Error(e);
        }
    }


    const inputRef = useRef(null)
    function handleClickBtn() {
        if (!/^([0-9a-zA-Z]+[/]?[0-9a-zA-Z]+)+$/.test(uploadDirectory) && uploadDirectory !== '') {
            message.error('路径只能含有英文和数字')
            return
        }
        inputRef.current && (inputRef.current as HTMLInputElement).click()
    }

    // 获取当前对应的文件夹的内容
    function getCurrentTagFiles() {
        if (activeDirectory === '') {

            return filesList.sort((a, b) => b.time - a.time);
        } else {
            return filesList.filter(v => v.directory === activeDirectory).sort((a, b) => b.time - a.time);
        }
    }


    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [activeDirectory, setActiveDirectory] = useState('');

    return (
        <div className="w-3/4 bg-white rounded-xl shadow-lg mt-8 ml-auto mr-auto p-8 ">
            {State()}
            <div className="flex mt-8 bg-gray-50 p-8 rounded-xl">
                <Options uploadDirectory={uploadDirectory} setUploadDirectory={setUploadDirectory} isNeedHash={isNeedHash} setIsNeedHash={setIsNeedHash} />
                {

                    !isUploading ?
                        (<div className={`flex mt-10 mr-8 items-center justify-center bg-green-500 w-32 h-32 rounded-full cursor-pointer text-white shadow-xl text-xl transition-all hover:bg-green-600 ${initState !== 'FINISHED' && 'hidden'}`} onClick={handleClickBtn}>
                            立即上传
                        </div>) :
                        (<Progress className="mt-10 mr-8 w-32 h-32" type="circle" percent={uploadPercentage} />)
                }
            </div>
            <Tags filesList={filesList} activeDirectory={activeDirectory} setActiveDirectory={setActiveDirectory} setPage={setPage} setUploadDirectory={setUploadDirectory} />
            {getCurrentTagFiles().length ? <div className="mt-8  bg-gray-50 p-8 rounded-xl">
                <h1 className="text-3xl font-bold">文件列表:</h1>
                <div>
                    {
                        getCurrentTagFiles().slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize).map((v: FileItemType, index) => (
                            <FileItem key={v.id} file={v.file} url={v.url} state={v.state} time={v.time} size={v.size} setFilesList={setFilesList} />
                        ))
                    }
                </div>
                <Pagination className='flex justify-center mt-5' current={page} defaultCurrent={1} total={getCurrentTagFiles().length} pageSize={pageSize} onChange={(page, pageSize) => { setPage(page); setPageSize(pageSize) }} />
            </div> : ''}
            <input className="invisible" type="file" onChange={handleUploadEvent} multiple ref={inputRef} />
            {contextHolder}
        </div>
    )
}