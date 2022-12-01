import { Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useState, useEffect } from 'react';
export default function Options({ uploadDirectory, setUploadDirectory, isNeedHash, setIsNeedHash }: {
    uploadDirectory: string,
    setUploadDirectory: Function,
    isNeedHash: boolean,
    setIsNeedHash: Function,
}) {
    const onChangeHashOption = (e: CheckboxChangeEvent) => {
        setIsNeedHash(e.target.checked)
    };

    const [randomHash, setRandomHash] = useState(CreateRandomHash());
    function CreateRandomHash() {
        let r = '';
        for (let i = 0; i < 10; i++) {
            r += Math.random().toString(36).substr(2, 1)
        }
        return (<span className="text-blue-600">-{r}</span>)
    }

    return (
        <div className="flex-1 items-center">
            <h1 className="text-3xl font-bold">配置项：</h1>
            <div className="flex items-center mt-8">
                <h2>上传目录：</h2>
                <b>/web/</b>
                <input onChange={(e) => setUploadDirectory(e.target.value)} value={uploadDirectory} className="border-transparent w-64 h-10 ml-2 pl-4 pr-4 bg-gray-200 rounded-md text-pink-600 text-2xl outline-none focus:ring focus:border-blue-200 focus:bg-gray-200 shadow-sm focus:shadow-md transition-all" type="text" max-length="20" />
                <b className="ml-2">/</b>
            </div>
            <div className='mt-4'><Checkbox checked={isNeedHash} onChange={onChangeHashOption}>追加文件哈希值</Checkbox></div>
            <div className="mt-4 text-gray-500">
                最终路径示例： https://cdn.meiqijiahceng.com/web/{<span className="text-pink-600">{uploadDirectory ? uploadDirectory + '/' : ''}</span>}sample{isNeedHash ? randomHash : ''}.png
            </div>
        </div>
    )
}