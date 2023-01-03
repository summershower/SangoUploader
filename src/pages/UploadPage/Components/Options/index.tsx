import { Checkbox, Popover } from 'antd';
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
    const hashIntroContent = (
        <div>
            <p>勾选哈希值，文件名会随着文件内容变化而变化。</p>
            <p>可以理解为<span className='text-red-400'>每个文件拥有独一无二的命名</span>。</p>
            <p>可以避免在目录相同时，上传了同名文件把之前的文件覆盖的情况。</p>
            <p>如果就是为了上传一个日后需要替换的文件？可以取消选择。</p>
            <p>不清楚?那就不用动。</p>
        </div>
    )

    return (
        <div className="flex-1 items-center">
            <h1 className="text-3xl font-bold">配置项：</h1>
            <div className="flex items-center mt-8">
                <h2>上传目录：</h2>
                <b>/web/</b>
                <input onChange={(e) => setUploadDirectory(e.target.value)} value={uploadDirectory} className="border-transparent w-64 h-10 ml-2 pl-4 pr-4 bg-gray-200 rounded-md text-pink-600 text-2xl outline-none focus:ring focus:border-blue-200 focus:bg-gray-200 shadow-sm focus:shadow-md transition-all font-bold" type="text" max-length="20" />
                <b className="ml-2">/</b>
            </div>
            <div className='mt-4'>
                <Popover content={hashIntroContent} title="这是什么玩意儿？">
                    <Checkbox checked={isNeedHash} onChange={onChangeHashOption}>追加文件哈希值</Checkbox>
                </Popover>

            </div>
            <div className="mt-4 text-gray-500">
                最终路径示例： https://cdn.meiqijiahceng.com/web/{<span className="text-pink-600 font-bold">{uploadDirectory ? uploadDirectory + '/' : ''}</span>}simple{isNeedHash ? randomHash : ''}.png
            </div>
        </div>
    )
}