import axios from 'axios'
import Log from '../../utils/logs.js'
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
export async function imagine (params) {
  const baseAPI = Config.getAPI()
  if (!baseAPI) {
    Log.e('未配置Midjourney API')
    return false
  }
  const configs = Config.getSetting()
  return await axios.post(baseAPI + '/mj/submit/imagine', params,
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
