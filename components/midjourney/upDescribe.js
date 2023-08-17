import axios from 'axios'
import Log from '../../utils/logs.js'
import Config from '../../components/config/config.js'

/**
 * 提交Describe任务
 * @param {object} params describeDTO
 * @param {string} params.base64 图片base64
 * @param {string} params.notifyHook 回调地址, 为空时使用全局notifyHook
 * @param {string} params.state 自定义参数
 * @returns
 */
export async function describe (params) {
  const baseAPI = Config.getAPI()
  if (!baseAPI) {
    Log.e('未配置Midjourney API')
    return false
  }
  const configs = Config.getSetting()
  return await axios.post(baseAPI + '/mj/submit/describe', params,
    configs.proxy.switch && configs.proxy.host && configs.proxy.port
      ? {
        proxy:
        {
          protocol: 'http',
          host: `${configs.proxy.host}`,
          port: `${Number(configs.proxy.port)}`
        }
      }
      : undefined)
}
