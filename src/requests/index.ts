import axios from 'axios';
export const getOSSConfig = () => {
    return new Promise((resolve, reject) => {
        axios.get('https://dev-gapi.meiqijiacheng.com:810/configure/getSTS?objectName=web').then((res) => {
            resolve(res.data.data)
        }).catch(e => {
            reject(e);
        })
    })
}