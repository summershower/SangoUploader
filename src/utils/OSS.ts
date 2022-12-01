const OSSFactory = require('ali-oss');
import { getOSSConfig } from '../requests'

interface IConfig {
    accessKeyId: string,
    aLiYunHost: string,
    bucketName: string,
    securityToken: string,
    accessKeySecret: string,
    objectName: string,
    url: string
}
export class IOSS {
    getOSS() { }
    initOSS() { }
}

async function getConfig() {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await getOSSConfig;
            resolve(res)
        } catch (err) {
            reject(err);
        }
    })
}
export class OSS implements IOSS {
    oss = null
    invalidTime = 0;
    getOSS() {
        return new Promise(async (resolve, reject) => {
            if (+new Date() < this.invalidTime) {
                resolve(this.oss);
            } else {
                try {
                    await this.initOSS();
                    resolve(this.oss);
                } catch (err) {
                    reject(err);
                }
            }
        })
    }
    initOSS() {
        return new Promise(async (resolve, reject) => {
            try {
                const config = await getOSSConfig() as IConfig
                const { aLiYunHost: region, accessKeyId, accessKeySecret, bucketName: bucket, securityToken: stsToken } = config
                this.oss = new OSSFactory({
                    region: region.replace('.aliyuncs.com', ''),
                    accessKeyId,
                    accessKeySecret,
                    stsToken,
                    bucket,
                })
                this.invalidTime = +new Date() + 3600 * 1000;
                resolve(true)
            } catch (e) {
                console.log(e)
                reject('请求OSS配置出错');
            }
        })
    }
}