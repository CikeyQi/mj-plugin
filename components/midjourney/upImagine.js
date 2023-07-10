import axios from 'axios'
import Config from '../../components/config/config.js'

/** 
 * 提交Imagine任务
 * @param {object} params imagineDTO
 * @param {string} params.base64 垫图base64
 * @param {string} params.notifyHook 回调地址, 为空时使用全局notifyHook
 * @param {string} params.prompt 提示词
 * @param {string} params.state 自定义参数
 * @returns
 */
export async function imagine(params) {
    let baseAPI = Config.getAPI()
    if (!baseAPI) {
        Log.e('未配置Midjourney API')
        return false
    }
    return axios.post(baseAPI + '/mj/submit/imagine', params)
}