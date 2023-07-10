import axios from 'axios'
import Config from '../../components/config/config.js'

/** 
 * 根据条件查询任务
 * @param {object} params conditionDTO
 * @param {array} params.ids 
 * @returns
 */
export async function listByCondition(params) {
    let baseAPI = Config.getAPI()
    if (!baseAPI) {
        Log.e('未配置Midjourney API')
        return false
    }
    return await axios.post(baseAPI + `/mj/task/list-by-condition`, params);
  }