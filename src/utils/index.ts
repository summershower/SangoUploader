import sparkMD5 from 'spark-md5'
import { message } from 'antd'

// 获取文件哈希值
export function getHashName(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (event) => {
            const buffer = event!.target!.result
            const hashName = new sparkMD5.ArrayBuffer().append(buffer).end()
            const suffix = /\.([a-zA-Z0-9]+)$/.exec(file.name)?.[1]
            resolve(
                file.name.replace('.' + suffix, '') + '-' + hashName.substr(-9) + '.' + suffix
            )
        }
        reader.onerror = (reason) => {
            reject(reason)
        }
    })
}

// 复制文本
export function handleCopy(text: string) {
    const input = document.createElement("input"); // js创建一个input输入框
    input.value = text; // 将需要复制的文本赋值到创建的input输入框中
    document.body.appendChild(input); // 将输入框暂时创建到实例里面
    input.select(); // 选中输入框中的内容
    document.execCommand("Copy"); // 执行复制操作
    document.body.removeChild(input); // 最后删除实例中临时创建的input输入框，完成复制操作
    message.success('复制URL成功')
}

// Promise并发限制
export class PromisePool {
    maxConcurrencyLimit: number = 5; // 最大并发数
    tasks: (() => Promise<any>)[] = []; // 所有Promise任务池
    processingTasks: Promise<any>[] = []; // 回调
    failedTasks: (() => Promise<any>)[] = []; // 已经失败的任务
    state: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' = 'PENDING'; // 当前状态
    processCallback?: Function; // 监控状态用的回调
    total: number = 0; // 总任务数
    constructor(promises: (() => Promise<any>)[], maxConcurrencyLimit: number = 5, processCallback?: Function) {
        this.maxConcurrencyLimit = maxConcurrencyLimit;
        this.tasks = promises;
        this.total = promises.length;
        this.processCallback = processCallback;
        this.handleCallback();
    }
    start() {
        // 开始时，先往任务池推入最大并发量任务
        this.state = "PROCESSING";
        while (this.processingTasks.length < this.maxConcurrencyLimit && this.tasks.length) {
            this.handleOneTask();
        }
        // 使用Race接管第一个完成的then事件
        const race = Promise.race(this.processingTasks);
        this.handleRace(race);

    }
    // 处理Race事件
    handleRace(race: Promise<any>) {
        const handler = () => {
            // 如果任务池还有没完成的任务，继续执行
            if (this.tasks.length && this.processingTasks.length < this.maxConcurrencyLimit) {
                this.handleOneTask();
                this.handleRace(Promise.race(this.processingTasks));
            }
        }
        race.then(handler, handler);
    }
    // 在任务池中取出一个任务，接管其Promise的then方法，任务完成时推出该任务
    handleOneTask() {
        let fn: () => Promise<any> = this.tasks.shift() as () => Promise<any>;;
        const promise = fn();
        promise.then(() => {
            this.processingTasks.splice(this.processingTasks.findIndex(v => v === promise), 1);
            this.checkFinallyState();
        }, (err) => {
            console.log(err);
            
            const index = this.processingTasks.findIndex(v => v === promise)
            this.processingTasks.splice(index, 1);
            this.failedTasks.push(fn);
            this.checkFinallyState();

        })
        this.processingTasks.push(promise);
    }
    // 检查最终状态
    checkFinallyState() {
        if (!this.tasks.length && !this.processingTasks.length) {
            // 任务都完成了，检查失败池
            if (this.failedTasks.length) {
                console.log('Race：有失败任务');
                this.state = 'FAILED';
            } else {
                console.log('Race: 任务完成 ');
                this.state = 'SUCCESS';
            }
        }
        this.handleCallback();
    }
    // 状态回调函数
    handleCallback() {
        // console.log('状态更新', this.state, '总任务数：' + this.tasks.length, '进行中任务：' + this.processingTasks.length, '失败任务：' + this.failedTasks.length, this.total);
        if (this.processCallback) {
            this.processCallback(this.state, this.processingTasks.length, this.tasks.length, this.failedTasks.length, this.total);
        }
    }

}
// function su(): Promise<any> {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve(true);
//         }, 500 + Math.floor(Math.random() * 1000))
//     })
// }

// function fa(): Promise<any> {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             reject();
//         }, 3000)
//     })
// }


// let testPool = [];
// testPool.push(fa);

// for (let i = 0; i < 30; i++) {
//     testPool.push(su);
// }
// testPool.push(fa);
// testPool.push(fa);


// for (let i = 0; i < 10; i++) {
//     testPool.push(su);
// }
// const pp = new PromisePool(testPool);
// pp.start();