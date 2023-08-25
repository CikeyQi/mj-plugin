import fs from 'node:fs'
import Init from './model/init.js'
if (!global.segment) {
  global.segment = (await import('oicq')).segment
}
const catlist = ['😸', '😹', '😺', '😻', '😼', '😽', '😾', '😿', '🙀']
logger.info('---------------')
logger.mark(
  logger.green(
    `[${
      catlist[Math.floor(Math.random() * catlist.length)]
    }]MJ-Plugin插件自检中......`
  )
)
logger.mark(
  logger.green(
    'MJ插件交流群：璃月621069204，稻妻646582537，群内有官方绘图机器人'
  )
)
const files = fs
  .readdirSync('./plugins/mj-plugin/apps')
  .filter((file) => file.endsWith('.js'))
let ret = []
files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})
ret = await Promise.allSettled(ret)
const apps = {}
for (const i in files) {
  const name = files[i].replace('.js', '')

  if (ret[i].status != 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}
Init.initConfig()
export { apps }
logger.info('---------------')
