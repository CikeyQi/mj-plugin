import plugin from '../../../lib/plugins/plugin.js'
import { Midjourney } from 'midjourney'
import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'
import WebSocket from 'isomorphic-ws'
import _ from 'lodash'
import fs from 'fs'
import Log from '../utils/logs.js'
import Config from '../components/Config.js'
import { pluginRoot } from '../model/path.js'
import Version from '../components/Version.js'

const proxyFetch = async (input, init) => {
  const agent = new HttpsProxyAgent(Config.getConfig().proxy_url, {
    keepAlive: true
  })
  if (!init) init = {}
  init.agent = agent
  return fetch(input, init)
}

class ProxyWebSocket extends WebSocket {
  constructor(address, options) {
    const agent = new HttpsProxyAgent(Config.getConfig().proxy_url, {
      keepAlive: true
    })
    if (!options) options = {}
    options.agent = agent
    super(address, options)
  }
}

export async function Main() {
  try {
    const client = new Midjourney({
      ServerId: Config.getConfig().server_id,
      ChannelId: Config.getConfig().channel_id,
      SalaiToken: Config.getConfig().salai_token,
      HuggingFaceToken: Config.getConfig().huggingface_token,
      Debug: Config.getConfig().debug,
      Ws: true,
      fetch: Config.getConfig().proxy ? proxyFetch : fetch,
      WebSocket: Config.getConfig().proxy ? ProxyWebSocket : WebSocket
    })
    await client.init()
    global.mjClient = client
  } catch (err) {
    Log.e(err)
  }
}

export class Help extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'MJ-帮助',
      /** 功能描述 */
      dsc: 'Midjourney 帮助',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?(mj|MJ)帮助$',
          /** 执行方法 */
          fnc: 'help'
        }
      ]
    })
  }

  async help(e) {
    const helpCfg = {
      "themeSet": false,
      "title": "#MJ-plugin帮助",
      "subTitle": "Yunzai-Bot & MJ-plugin",
      "colWidth": 265,
      "theme": "all",
      "themeExclude": [
        "default"
      ],
      "colCount": 2,
      "bgBlur": true
    }
    const helpList = [
      {
        "group": "MJ绘图",
        "list": [
          {
            "icon": 1,
            "title": "#MJ想象",
            "desc": "以文生图"
          },
          {
            "icon": 54,
            "title": "#MJ描述[图片]",
            "desc": "以图生文"
          },
          {
            "icon": 5,
            "title": "#MJ混合",
            "desc": "图片融合"
          },
          {
            "icon": 7,
            "title": "#MJ放大[图片id]第一张",
            "desc": "放大指定id图片,默认最近一次结果"
          },
          {
            "icon": 38,
            "title": "#MJ变化[图片id]第一张",
            "desc": "变化指定id图片,默认最近一次结果"
          },
          {
            "icon": 11,
            "title": "#MJ重绘[图片id]",
            "desc": "指定id图片tag重绘,默认最近一次结果"
          },
          {
            "icon": 86,
            "title": "#MJ换脸",
            "desc": "将图1的脸换至图2"
          },
          {
            "icon": 54,
            "title": "#MJ调整[图片id](强大|微妙)",
            "desc": "图片微调,使用前请先放大图片"
          },
          {
            "icon": 3,
            "title": "#MJ平移{上|下|左|右)",
            "desc": "图片平移,使用前请先放大图片"
          },
          {
            "icon": 35,
            "title": "#MJ拓展[图片id]custom(1-10)",
            "desc": "图片拓展,使用前请先放大图片"
          },
          {
            "icon": 36,
            "title": "#MJ优化",
            "desc": "优化tag描述词"
          },
          {
            "icon": 30,
            "title": "#MJ按钮",
            "desc": "模拟与官方MJ机器人交互"
          },
          {
            "icon": 62,
            "title": "#MJ参数",
            "desc": "可选绘图参数列表"
          },
          {
            "icon": 62,
            "title": "#MJ帮助",
            "desc": "MJ-plugin插件帮助"
          }
        ],
      },
      {
        "group": "MJ管理",
        "list": [
          {
            "icon": 65,
            "title": "#MJ(连接|重连|断开)",
            "desc": "Discord代理客户端连接设置"
          },
          {
            "icon": 64,
            "title": "#MJ设置",
            "desc": "当前MJ账号设置"
          },
          {
            "icon": 63,
            "title": "#MJ快速模式",
            "desc": "快速模式,请注意额度使用"
          },
          {
            "icon": 67,
            "title": "#MJ舒缓模式",
            "desc": "舒缓模式,没有额外费用,速度较慢"
          },
          {
            "icon": 68,
            "title": "#MJ信息",
            "desc": "查看当前帐号MJ额度等信息"
          },
          {
            "icon": 69,
            "title": "#MJ[强制]更新",
            "desc": "插件更新"
          }
        ]
      },
      {
        "group": "MJ配置",
        "list": [
          {
            "icon": 11,
            "title": "#MJ配置服务器ID",
            "desc": "Discord服务器ID,服务器地址中前一项"
          },
          {
            "icon": 12,
            "title": "#MJ配置频道ID",
            "desc": "Discord频道ID,服务器地址中后一项"
          },
          {
            "icon": 13,
            "title": "#MJ配置账号token",
            "desc": "Discord账号token"
          },
          {
            "icon": 14,
            "title": "#MJ配置抱脸token",
            "desc": "换脸功能需要配置huggingface账号token"
          },
          {
            "icon": 15,
            "title": "#MJ配置调试模式(开启|关闭)",
            "desc": "Discord连接调试模式,修改后请重连"
          },
          {
            "icon": 16,
            "title": "#MJ配置代理(开启|关闭)",
            "desc": "是否开启代理"
          },
          {
            "icon": 17,
            "title": "#MJ配置代理地址",
            "desc": "#MJ配置代理地址http://127.0.0.1:7890"
          },
          {
            "icon": 18,
            "title": "#MJ配置(百度|有道)翻译appid",
            "desc": "配置翻译接口appid"
          },
          {
            "icon": 19,
            "title": "#MJ配置(百度|有道)翻译appkey",
            "desc": "配置翻译接口appkey"
          },
          {
            "icon": 20,
            "title": "#MJ配置使用翻译接口(百度|有道)",
            "desc": "将当前翻译服务设置为百度|有道"
          },
          {
            "icon": 21,
            "title": "#MJ配置不使用翻译接口",
            "desc": "不使用翻译服务"
          },
          {
            "icon": 22,
            "title": "#MJ配置",
            "desc": "查看当前所有配置项"
          }
        ]
      }
    ]
    let helpGroup = []
    _.forEach(helpList, (group) => {
      _.forEach(group.list, (help) => {
        let icon = help.icon * 1
        if (!icon) {
          help.css = 'display:none'
        } else {
          let x = (icon - 1) % 10
          let y = (icon - x - 1) / 10
          help.css = `background-position:-${x * 50}px -${y * 50}px`
        }
      })
      helpGroup.push(group)
    })

    let themeData = await this.getThemeData(helpCfg, helpCfg)

    return await this.render('helpTemp/helpTemp', {
      helpCfg,
      helpGroup,
      ...themeData,
      element: 'default'
    }, { e })
  }


  getThemeCfg() {
    let resPath = '{{_res_path}}/helpTemp/'
    return {
      main: `${resPath}/main.png`,
      bg: `${resPath}/bg.jpg`,
      style: {
        // 主文字颜色
        fontColor: '#ceb78b',
        // 主文字阴影： 横向距离 垂直距离 阴影大小 阴影颜色
        // fontShadow: '0px 0px 1px rgba(6, 21, 31, .9)',
        fontShadow: 'none',
        // 描述文字颜色
        descColor: '#eee',

        /* 面板整体底色，会叠加在标题栏及帮助行之下，方便整体帮助有一个基础底色
        *  若无需此项可将rgba最后一位置为0即为完全透明
        *  注意若综合透明度较低，或颜色与主文字颜色过近或太透明可能导致阅读困难 */
        contBgColor: 'rgba(6, 21, 31, .5)',

        // 面板底图毛玻璃效果，数字越大越模糊，0-10 ，可为小数
        contBgBlur: 3,

        // 板块标题栏底色
        headerBgColor: 'rgba(6, 21, 31, .4)',
        // 帮助奇数行底色
        rowBgColor1: 'rgba(6, 21, 31, .2)',
        // 帮助偶数行底色
        rowBgColor2: 'rgba(6, 21, 31, .35)'
      }
    }
  }

  async getThemeData(diyStyle, sysStyle) {
    let helpConfig = _.extend({}, diyStyle, sysStyle)
    let colCount = Math.min(5, Math.max(parseInt(helpConfig?.colCount) || 3, 2))
    let colWidth = Math.min(500, Math.max(100, parseInt(helpConfig?.colWidth) || 265))
    let width = Math.min(2500, Math.max(800, colCount * colWidth + 30))
    let theme = this.getThemeCfg()
    let themeStyle = theme.style || {}
    let ret = [`
      body{background-image:url(${theme.bg});width:${width}px;}
      .container{background-image:url(${theme.main});width:${width}px;background-size:cover}
      .help-table .td,.help-table .th{width:${100 / colCount}%}
      `]
    let css = function (sel, css, key, def, fn) {
      let val = (function () {
        for (let idx in arguments) {
          if (!_.isUndefined(arguments[idx])) {
            return arguments[idx]
          }
        }
      })(themeStyle[key], diyStyle[key], sysStyle[key], def)
      if (fn) {
        val = fn(val)
      }
      ret.push(`${sel}{${css}:${val}}`)
    }
    css('.help-title,.help-group', 'color', 'fontColor', '#ceb78b')
    css('.help-title,.help-group', 'text-shadow', 'fontShadow', 'none')
    css('.help-desc', 'color', 'descColor', '#eee')
    css('.cont-box', 'background', 'contBgColor', 'rgba(43, 52, 61, 0.8)')
    css('.cont-box', 'backdrop-filter', 'contBgBlur', 3, (n) => diyStyle.bgBlur === false ? 'none' : `blur(${n}px)`)
    css('.help-group', 'background', 'headerBgColor', 'rgba(34, 41, 51, .4)')
    css('.help-table .tr:nth-child(odd)', 'background', 'rowBgColor1', 'rgba(34, 41, 51, .2)')
    css('.help-table .tr:nth-child(even)', 'background', 'rowBgColor2', 'rgba(34, 41, 51, .4)')
    return {
      style: `<style>${ret.join('\n')}</style>`,
      colCount
    }
  }

  async render(path, params, cfg) {
    let { e } = cfg
    if (!e.runtime) {
      console.log('未找到e.runtime，请升级至最新版Yunzai')
    }

    let BotName = Version.isMiao ? 'Miao-Yunzai' : 'Yunzai-Bot'
    let currentVersion = null
    const package_path = `${pluginRoot}/package.json`
    try {
      const package_json = JSON.parse(fs.readFileSync(package_path, 'utf-8'))
      if (package_json.version) {
        currentVersion = package_json.version
      }
    } catch (err) {
      Log.e('读取package.json失败', err)
    }
    return e.runtime.render('mj-plugin', path, params, {
      retType: cfg.retMsgId ? 'msgId' : 'default',
      beforeRender({ data }) {
        let pluginName = 'mj-plugin' + `<span class="version">${currentVersion}`
        let resPath = data.pluResPath
        const layoutPath = process.cwd() + '/plugins/mj-plugin/resources/common/layout/'
        return {
          ...data,
          _res_path: resPath,
          _mj_path: resPath,
          defaultLayout: layoutPath + 'default.html',
          sys: {
            scale: 'style=transform:scale(1.8)'
          },
          copyright: `Created By ${BotName}<span class="version">${Version.yunzai}</span>${pluginName}</span>`,
        }
      }
    })

  }
}