import axios from 'axios';
export const getOSSConfig = () => {
    return new Promise((resolve, reject) => {
        axios.get('https://gapi.meiqijiacheng.com/configure/getSTS?objectName=web').then((res) => {
            resolve(res.data.data)
        }).catch(e => {
            reject(e);
        })
    })
}