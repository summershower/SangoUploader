import { useState, useEffect, useRef, DragEventHandler } from 'react';
import Options from './Components/Options'
import FileItem from './Components/FileItem'
import { OSS } from '@/utils/OSS'
import { useDB, readLog, addLog, delLog } from '@/utils/IndexDB'
import type { FileItemType, } from './types'
import { message, Pagination, Progress } from 'antd'
import { getHashName, PromisePool } from '@/utils'
import './index.less'
import Tags from './Components/Tags';

let ossObject = new OSS();
let ossInstance: any // OSS对象实例

export default function Upload() {
    // 初始化OSS实例设置
    async function initOSS() {
        try {
            ossInstance = await ossObject.getOSS()
            setInitState('FINISHED')
            addDragEvent();
        } catch (e) {
            setInitState('ERROR')
        }

    }
    // 获取IndexDB中的历史数据
    useEffect(() => {
        initOSS()
        useDB().then(() => {
            readLog().then((res: any) => {
                console.log(res, 'indexDB');

                setFilesList(res);
            })
        })
    }, [])

    const [uploadDirectory, setUploadDirectory] = useState('test');
    const uploadDirectoryRef = useRef(uploadDirectory);
    useEffect(() => {
        uploadDirectoryRef.current = uploadDirectory;
    }, [uploadDirectory])
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
            promises.push(() => uploadToOSS(e.target.files[i], Math.floor(Math.random() * 10000000000000000), uploadDirectoryRef.current));
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
                setTimeout(() => {
                    setIsUploading(false);
                }, 700)
            }

        });
        PP.start();

    }

    const filesListRef = useRef(filesList);
    useEffect(() => {
        filesListRef.current = filesList;
    }, [filesList])

    // 上传到OSS
    async function uploadToOSS(file: File, id: number, directory: string) {
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
            const res = await ossInstance.put(`/web/${uploadDirectoryRef.current ? uploadDirectoryRef.current + '/' : ''}` + filename, file)
            const url = 'https://cdn.meiqijiacheng.com/' + res.name;

            const afterFiles = [...filesListRef.current];
            const targetFile = afterFiles.find(v => v.id === id);

            (targetFile as FileItemType).state = 'SUCCESS';
            (targetFile as FileItemType).url = url;

            // 检测去重
            for (let i = 0; i < afterFiles.length; i++) {
                if (afterFiles[i].size === file.size && afterFiles[i].url === url && afterFiles[i].id !== id) {
                    delLog(afterFiles[i].id);
                    afterFiles.splice(i, 1);
                    break;
                }
            }

            setFilesList([
                ...afterFiles
            ])
            setActiveDirectory(uploadDirectoryRef.current);

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
        if (!/^([0-9a-zA-Z]+[/]?[0-9a-zA-Z]+)+$/.test(uploadDirectoryRef.current) && uploadDirectoryRef.current !== '') {
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

    // 追加拖曳上传
    function addDragEvent() {
        document.querySelector('#dragBox')?.addEventListener('dragenter', handleDragEnter, false);
        document.querySelector('#dragMask')?.addEventListener('dragleave', handleDragLeave, false);
        document.querySelector('#dragMask')?.addEventListener('drop', handleDrop, false);

        document.querySelector('#dragMask')?.addEventListener('dragenter', prevent, false);
        document.querySelector('#dragBox')?.addEventListener('dragleave', prevent, false);
        document.querySelector('#dragMask')?.addEventListener('dragover', prevent, false);
        document.querySelector('#dragBox')?.addEventListener('dragover', prevent, false);
        document.querySelector('#dragBox')?.addEventListener('drop', prevent, false);
    }
    function handleDragEnter(e: any) {
        e.preventDefault();
        e.stopPropagation();
        (document.querySelector('#dragMask') as HTMLElement).style.display = 'flex';

    }
    function handleDrop(e: any) {
        e.preventDefault();
        e.stopPropagation();
        (document.querySelector('#dragMask') as HTMLElement).style.display = 'none';
        handleUploadEvent({
            target: {
                files: e.dataTransfer.files
            }
        });
    }
    function handleDragLeave(e: any) {
        e.preventDefault();
        e.stopPropagation();
        (document.querySelector('#dragMask') as HTMLElement).style.display = 'none';
    }
    function prevent(e: any) {
        e.preventDefault();
        e.stopPropagation();
    }

    return (
        <div className="w-3/4 bg-white rounded-xl shadow-lg mt-8 ml-auto mr-auto p-8">
            {State()}
            <div className="relative flex mt-8 bg-gray-50 p-8 rounded-xl" id='dragBox'>
                <Options uploadDirectory={uploadDirectory} setUploadDirectory={setUploadDirectory} isNeedHash={isNeedHash} setIsNeedHash={setIsNeedHash} />
                {

                    !isUploading ?
                        (<div className={`uploadBtn flex mt-4 mr-8 items-center justify-center w-32 h-32 rounded-full cursor-pointer text-white shadow-xl text-xl  ${initState !== 'FINISHED' && 'hidden'}`} onClick={handleClickBtn}>
                            <svg t="1669963956354" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5794" width="50" height="50"><path d="M873.411765 481.882353a60.235294 60.235294 0 0 1 120.470588 0v283.467294C993.882353 908.107294 878.953412 1024 736.858353 1024H287.141647C145.046588 1024 30.117647 908.107294 30.117647 765.349647V481.882353a60.235294 60.235294 0 1 1 120.470588 0v283.467294C150.588235 841.788235 211.847529 903.529412 287.141647 903.529412h449.716706C812.152471 903.529412 873.411765 841.788235 873.411765 765.349647V481.882353z" p-id="5795" fill="#dbdbdb"></path><path d="M451.764706 60.235294m60.235294 0l0 0q60.235294 0 60.235294 60.235294l0 602.352941q0 60.235294-60.235294 60.235295l0 0q-60.235294 0-60.235294-60.235295l0-602.352941q0-60.235294 60.235294-60.235294Z" p-id="5796" fill="#dbdbdb"></path><path d="M508.988235 170.345412L338.522353 340.751059a60.235294 60.235294 0 0 1-85.172706-85.172706L466.401882 42.586353a60.235294 60.235294 0 0 1 85.172706 0l212.931765 212.992a60.235294 60.235294 0 1 1-85.172706 85.172706L508.988235 170.345412z" p-id="5797" fill="#dbdbdb"></path></svg>
                        </div>) :
                        (<Progress className="mt-4 mr-8 w-32 h-32" type="circle" percent={uploadPercentage} />)
                }
                {
                    !isUploading ? (
                        <div className={`flipAnimation absolute right-14 bottom-8 text-gray-400 text-sm ${initState !== 'FINISHED' && 'hidden'}`}>点击上传或拖曳文件至此</div>
                    ) : ''
                }
                <div id='dragMask' className='rounded-xl '>放手即可上传</div>
            </div>
            <Tags filesList={filesList} activeDirectory={activeDirectory} setActiveDirectory={setActiveDirectory} setPage={setPage} setUploadDirectory={setUploadDirectory} setFilesList={setFilesList} />
            {getCurrentTagFiles().length ? <div className="mt-8  bg-gray-50 p-8 rounded-xl">
                <h1 className="text-3xl font-bold">文件列表:</h1>
                <div>
                    {
                        getCurrentTagFiles().slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize).map((v: FileItemType) => (
                            <FileItem key={v.id} file={v.file} url={v.url} state={v.state} time={v.time} size={v.size} id={v.id} setFilesList={setFilesList} />
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