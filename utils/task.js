import Log from './logs.js'
import { fetch } from '../components/midjourney/queID.js'
import Config from '../components/config/config.js'

export async function getResults(id) {
    let baseAPI = Config.getAPI()
    if (!baseAPI) {
        Log.e('未配置Midjourney API')
        return false
    }

    let task = await fetch(id)

    while (task.data.status == 'IN_PROGRESS' || task.data.status == 'NOT_START' || task.data.status == 'SUBMITTED') {
        Log.i(`[${task.data.progress}]等待任务完成...`)
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, 3000)
        })
        task = await fetch(id)
    }
    if (task.data.status == 'SUCCESS') {
        return task.data
    } else if (task.data.status == 'FAILURE') {
        Log.e(task.data.failReason)
        return false
    }
}