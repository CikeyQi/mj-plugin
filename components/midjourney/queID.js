import axios from 'axios'
import Config from '../../components/config/config.js'

/** 
 * 指定ID获取任务
 * @param {string} id 任务ID
  * @returns
 */
export async function fetch(id) {
    let baseAPI = Config.getAPI()
    if (!baseAPI) {
        return false
    }
    return await axios.get(baseAPI + `/mj/task/${id}/fetch`);
}