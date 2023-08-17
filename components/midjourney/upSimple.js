import axios from 'axios'
import Log from '../../utils/logs.js'
import Config from '../../components/config/config.js'

/**
 * 绘图变化-simple
 * @param {object} params simpleChangeDTO
 * @param {string} params.content 变化描述: ID $action$index
 * @param {string} params.notifyHook 回调地址, 为空时使用全局notifyHook
 * @param {string} params.state 自定义参数
 * @returns
 */
export async function simpleChange (params) {
  const baseAPI = Config.getAPI()
  if (!baseAPI) {
    Log.e('未配置Midjourney API')
    return false
  }
  const configs = Config.getSetting()
  return await axios.post(baseAPI + '/mj/submit/simple-change', params, configs.proxy.switch && configs.proxy.host && configs.proxy.port
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
