import axios from 'axios'
import Config from '../../components/config/config.js'

/** 
 * 提交Describe任务
 * @param {object} params describeDTO
 * @param {string} params.base64 图片base64
 * @param {string} params.notifyHook 回调地址, 为空时使用全局notifyHook
 * @param {string} params.state 自定义参数
 * @returns
 */
export async function describe(params) {
    let baseAPI = Config.getAPI()
    if (!baseAPI) {
        return false
    }
    return await axios.post(baseAPI + '/mj/submit/describe', params)
}