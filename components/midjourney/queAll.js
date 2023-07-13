import axios from 'axios'
import Log from '../../utils/logs.js'
import Config from '../../components/config/config.js'

/** 
 * 查询所有任务
 * @returns
 */
export async function list() {
    let baseAPI = Config.getAPI()
    if (!baseAPI) {
        Log.e('未配置Midjourney API')
        return false
    }
    return await axios.get(baseAPI + `/mj/task/list`);
  }