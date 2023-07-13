import axios from 'axios'
import Config from '../../components/config/config.js'

/** 
 * 指定图片ID取图片
 * @param {object} 任务信息
 */
export async function getPic(task) {
    let configs = Config.getSetting()
    const img = await axios.get(task.imageUrl,
        {
            responseType: 'arraybuffer',
            proxy: configs.proxy.host && configs.proxy.port ? {
                protocol: 'http',
                host: `${configs.proxy.host}`, port: `${Number(configs.proxy.port)}`
            } : undefined
        }
    )
    let base64 = Buffer.from(img.data, 'binary').toString('base64')
    return base64
  }