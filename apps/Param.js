import plugin from '../../../lib/plugins/plugin.js'
import { pluginResources } from '../model/path.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'

export class Param extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-参数列表',
      /** 功能描述 */
      dsc: 'Midjourney 参数列表',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?(mj|MJ)参数(列表)?$',
          /** 执行方法 */
          fnc: 'param'
        }
      ]
    })
  }

  async param (e) {
    const TmpModels = [
      [
        {
          list1: '--ar n:n',
          list2: '纵横比，默认1:1。用于指定绘制图像的横纵比。'
        },
        {
          list1: '--chaos <number 0–100>',
          list2:
            '变化程度，数值越高结果越不寻常和意想不到。用于控制图像的抽象程度。'
        },
        {
          list1: '--fast',
          list2:
            '使用快速模式运行单个任务。加快任务完成速度，但可能降低图像质量。'
        },
        {
          list1: '--iw <0–2>',
          list2:
            '设置图像提示权重相对于文本权重，默认值为1。用于控制图像与文本提示之间的权重分配。'
        },
        {
          list1: '--no',
          list2:
            '反向提示，例如 --no plants 会尝试从图像中移除植物。用于在图像中排除某些元素。'
        },
        {
          list1: '--q 清晰度',
          list2:
            '.25 .5 1 分别代表: 一般,清晰,高清，默认1。控制图像的清晰度，较高的值会提高图像质量，但可能需要更长的处理时间。'
        },
        {
          list1: '--relax',
          list2: '使用放松模式运行单个任务。在较短的时间内生成较为轻松的图像。'
        },
        {
          list1: '--seed <0–4294967295>',
          list2:
            '用于生成初始图像网格的种子数，相同的种子数和提示将产生相似的最终图像。用于控制图像的随机性。'
        },
        {
          list1: '--stop <10–100>',
          list2:
            '在过程中部分完成任务，较早停止的任务可能产生模糊、细节较少的结果。用于在图像生成过程中提前停止，以节省时间。'
        },
        {
          list1:
            '--style <raw, 4a, 4b, 4c, cute, expressive, original, scenic>',
          list2:
            '切换不同的Midjourney模型版本和Niji模型版本。选择不同的绘画风格。'
        },
        {
          list1: '--s 1-1000',
          list2:
            '风格化 影响默认美学风格在任务中的应用程度。用于调整风格强度。'
        },
        {
          list1: '--tile',
          list2:
            '生成可用于创建无缝图案的重复图块的图像。生成可用于平铺的图像。'
        },
        {
          list1: '--turbo',
          list2:
            '使用涡轮模式运行单个任务。加快任务完成速度，但可能降低图像质量。'
        },
        {
          list1: '--weird <0–3000>',
          list2:
            '使用实验性参数 --weird 探索不寻常的美学。生成具有独特风格的图像。'
        },
        {
          list1: '--version <1, 2, 3, 4, 5, 5.1, or 5.2>',
          list2: '使用不同版本的Midjourney算法。选择不同的绘画算法版本。'
        },
        {
          list1: '--niji',
          list2:
            '使用专注于动漫风格图像的替代模型。生成具有日本动漫风格的图像。'
        }
      ]
    ]
    const base64 = await puppeteer.screenshot('mj-plugin', {
      saveId: 'Param',
      imgType: 'png',
      tplFile: `${pluginResources}/listTemp/listTemp.html`,
      pluginResources,
      header: 'Midjourney 参数列表',
      lable: '查看绘制图片时可用的参数',
      sidebar: '参数列表',
      list1: '参数',
      list2: '说明',
      modelsGroup: TmpModels,
      notice:
        'fast与trubo参数已经被禁用，仅主人可用，若想使用请进入 Discord 手动修改。'
    })
    await e.reply(base64)
    return true
  }
}
