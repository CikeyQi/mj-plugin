import axios from 'axios'
import Log from '../../utils/logs.js'
import Config from '../../components/config/config.js'

/**
 * 提交Blend任务
 * @param {object} params blendDTO
 * @param {array} params.base64Array 图片base64数组
 * @param {string} params.dimensions 比例: PORTRAIT(2:3); SQUARE(1:1); LANDSCAPE(3:2),可用值:PORTRAIT,SQUARE,LANDSCAPE
 * @param {string} params.notifyHook 回调地址, 为空时使用全局notifyHook
 * @param {string} params.state 自定义参数
 * @returns
 */
export async function blend (params) {
  const baseAPI = Config.getAPI()
  if (!baseAPI) {
    Log.e('未配置Midjourney API')
    return false
  }
  return await axios.post(baseAPI + '/mj/submit/blend', params)
}
