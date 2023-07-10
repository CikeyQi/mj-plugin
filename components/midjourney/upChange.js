import axios from 'axios'
import Config from '../../components/config/config.js'

/** 
 * 绘图变化
 * @param {object} params changeDTO
 * @param {string} params.action UPSCALE(放大); VARIATION(变换); REROLL(重新生成),可用值:UPSCALE,VARIATION,REROLL
 * @param {number} params.index 序号(1~4), action为UPSCALE,VARIATION时必传
 * @param {string} params.notifyHook 回调地址, 为空时使用全局notifyHook
 * @param {string} params.state 自定义参数
 * @param {string} params.taskId 任务ID
 * @returns
 */
export async function change(params) {
    let baseAPI = Config.getAPI()
    if (!baseAPI) {
        Log.e('未配置Midjourney API')
        return false
    }
    return await axios.post(baseAPI + '/mj/submit/change', params)
}