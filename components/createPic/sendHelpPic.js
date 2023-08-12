import Render from './Render.js'
import { style } from '../../resources/help/imgs/config.js'
import _ from 'lodash'

export async function sendHelpPic (e) {
  const helpCfg = {
    themeSet: false,
    title: '#MidJourney帮助',
    subTitle: 'Yunzai-Bot & mj-plugin',
    colWidth: 265,
    theme: 'all',
    themeExclude: ['default'],
    colCount: 2,
    bgBlur: true
  }
  const helpList = [
    {
      group: 'MJ绘图',
      list: [
        {
          icon: 1,
          title: '#想象',
          desc: '绘图,支持文生图以及图生图'
        },
        {
          icon: 5,
          title: '#放大',
          desc: '#放大2 将图2放大'
        },
        {
          icon: 7,
          title: '#变幻',
          desc: '#变幻2 将图2修改重绘'
        },
        {
          icon: 11,
          title: '#描述',
          desc: '#描述+图片 图生文'
        },
        {
          icon: 54,
          title: '#查询全部结果',
          desc: '发送接口中所有绘制历史'
        },
        {
          icon: 86,
          title: '#查询结果',
          desc: '#查询结果+序号或图片ID 发送图片'
        },
        {
          icon: 3,
          title: '#mj帮助',
          desc: '查看帮助'
        }
      ]
    },
    {
      group: 'MJ设置',
      list: [
        {
          icon: 38,
          title: '#mj设置接口',
          desc: '设置接口地址'
        },
        {
          icon: 32,
          title: '#mj设置代理',
          desc: '设置代理地址'
        },
        {
          icon: 48,
          title: '#mj设置代理开启',
          desc: '设置代理开关'
        },
        {
          icon: 27,
          title: '#mj设置屏蔽艾特开启',
          desc: '仅在频道公域机器人有效'
        }
      ]
    },
    {
      group: 'MJ管理',
      list: [
        {
          icon: 77,
          title: '#mj全局群聊设置个人cd',
          desc: '设置群个人CD开启以及时间'
        },
        {
          icon: 79,
          title: '#mj全局群聊设置共享cd',
          desc: '设置群共享CD开启以及时间'
        },
        {
          icon: 73,
          title: '#mj私聊设置cd',
          desc: '设置私聊CD开启及时间'
        },
        {
          icon: 72,
          title: '#mj(封禁|解封)群',
          desc: '将群拉入黑名单'
        },
        {
          icon: 23,
          title: '#mj(拉黑|解除拉黑)',
          desc: '将用户拉入黑名单'
        }
      ]
    }
  ]
  const helpGroup = []
  _.forEach(helpList, (group) => {
    _.forEach(group.list, (help) => {
      const icon = help.icon * 1
      if (!icon) {
        help.css = 'display:none'
      } else {
        const x = (icon - 1) % 10
        const y = (icon - x - 1) / 10
        help.css = `background-position:-${x * 50}px -${y * 50}px`
      }
    })
    helpGroup.push(group)
  })

  const themeData = await getThemeData(helpCfg, helpCfg)
  return await Render.render(
    'help/index',
    {
      helpCfg,
      helpGroup,
      ...themeData,
      element: 'default'
    },
    { e, scale: 1.6 }
  )
}

async function getThemeCfg () {
  const resPath = '{{_res_path}}/help/imgs/'
  return {
    main: `${resPath}/main.png`,
    bg: `${resPath}/bg.jpg`,
    style
  }
}

function getDef () {
  for (const idx in arguments) {
    if (!_.isUndefined(arguments[idx])) {
      return arguments[idx]
    }
  }
}

async function getThemeData (diyStyle, sysStyle) {
  const helpConfig = _.extend({}, sysStyle, diyStyle)
  const colCount = Math.min(
    5,
    Math.max(parseInt(helpConfig?.colCount) || 3, 2)
  )
  const colWidth = Math.min(
    500,
    Math.max(100, parseInt(helpConfig?.colWidth) || 265)
  )
  const width = Math.min(2500, Math.max(800, colCount * colWidth + 30))
  const theme = await getThemeCfg()
  const themeStyle = theme.style || {}
  const ret = [
    `
    body{background-image:url(${theme.bg});width:${width}px;}
    .container{background-image:url(${theme.main});width:${width}px;}
    .help-table .td,.help-table .th{width:${100 / colCount}%}
    `
  ]
  const css = function (sel, css, key, def, fn) {
    let val = getDef(themeStyle[key], diyStyle[key], sysStyle[key], def)
    if (fn) {
      val = fn(val)
    }
    ret.push(`${sel}{${css}:${val}}`)
  }
  css('.help-title,.help-group', 'color', 'fontColor', '#ceb78b')
  css('.help-title,.help-group', 'text-shadow', 'fontShadow', 'none')
  css('.help-desc', 'color', 'descColor', '#eee')
  css('.cont-box', 'background', 'contBgColor', 'rgba(43, 52, 61, 0.8)')
  css('.cont-box', 'backdrop-filter', 'contBgBlur', 3, (n) =>
    diyStyle.bgBlur === false ? 'none' : `blur(${n}px)`
  )
  css('.help-group', 'background', 'headerBgColor', 'rgba(34, 41, 51, .4)')
  css(
    '.help-table .tr:nth-child(odd)',
    'background',
    'rowBgColor1',
    'rgba(34, 41, 51, .2)'
  )
  css(
    '.help-table .tr:nth-child(even)',
    'background',
    'rowBgColor2',
    'rgba(34, 41, 51, .4)'
  )
  return {
    style: `<style>${ret.join('\n')}</style>`,
    colCount
  }
}
