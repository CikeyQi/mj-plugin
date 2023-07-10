import axios from 'axios'
import Config from '../../components/config/config.js'

/** 
 * 绘图变化-simple
 * @param {object} params simpleChangeDTO
 * @param {string} params.content 变化描述: ID $action$index
 * @param {string} params.notifyHook 回调地址, 为空时使用全局notifyHook
 * @param {string} params.state 自定义参数
 * @returns
 */
export async function simpleChange(params) {
    let baseAPI = Config.getAPI()
    if (!baseAPI) {
        return false
    }
    return await axios.post(baseAPI + '/mj/submit/simple-change', params)
}