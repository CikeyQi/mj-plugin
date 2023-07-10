import axios from 'axios'
import Config from '../../components/config/config.js'

/** 
 * 查询所有任务
 * @returns
 */
export async function list() {
    let baseAPI = Config.getAPI()
    if (!baseAPI) {
        return false
    }
    return await axios.get(baseAPI + `/mj/task/list`);
  }