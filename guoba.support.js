import Config from "./components/Config.js";
import lodash from "lodash";
import path from "path";
import { pluginRoot } from "./model/path.js";

export function supportGuoba() {
  return {
    pluginInfo: {
      name: 'mj-plugin',
      title: 'mj-plugin',
      author: ['@CikeyQi', '@erzaozi'],
      authorLink: ['https://github.com/CikeyQi', 'https://github.com/erzaozi'],
      link: 'https://github.com/CikeyQi/mj-plugin',
      isV3: true,
      isV2: false,
      description: '基于Yunzai-Bot的AI绘图插件，使用Midjourney接口',
      // 显示图标，此为个性化配置
      // 图标可在 https://icon-sets.iconify.design 这里进行搜索
      icon: 'mdi:stove',
      // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
      iconColor: '#d19f56',
      // 如果想要显示成图片，也可以填写图标路径（绝对路径）
      iconPath: path.join(pluginRoot, 'resources/icon.png'),
    },
    configInfo: {
      schemas: [
        {
          component: "Divider",
          label: "Discord 相关配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "server_id",
          label: "服务器ID",
          bottomHelpMessage: "Discord服务器ID",
          component: "Input",
          componentProps: {
            placeholder: 'Server ID',
            maxlength: 19,
          },
        },
        {
          field: "channel_id",
          label: "频道ID",
          bottomHelpMessage: "Discord频道ID",
          component: "Input",
          componentProps: {
            placeholder: 'Channel ID',
            maxlength: 19,
          },
        },
        {
          field: "salai_token",
          label: "Discord Token",
          bottomHelpMessage: "Discord身份验证Token",
          component: "Input",
          componentProps: {
            placeholder: 'Salai Token',
          },
        },
        {
          component: "Divider",
          label: "Bot 相关配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "bot_type",
          label: "Bot类型选择",
          component: "Select",
          componentProps: {
            options: [
              { label: 'Midjourney Bot', value: 'Midjourney' },
              { label: 'niji・journey Bot', value: 'Nijijourney' },
            ],
          },
        },
        {
          component: "Divider",
          label: "代理 相关配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "proxy",
          label: "使用代理",
          component: "Switch",
        },
        {
          field: "proxy_url",
          label: "代理地址",
          component: "Input",
          componentProps: {
            placeholder: 'Proxy URL',
          },
        },
        {
          component: "Divider",
          label: "翻译 相关配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "translate_use",
          label: "使用翻译接口",
          component: "Select",
          componentProps: {
            options: [
              { label: '椰奶有道', value: 0 },
              { label: '百度翻译（需配置）', value: 1 },
              { label: '有道翻译（需配置）', value: 2 },
            ],
          },
        },
        {
          field: "baidu_translate.appid",
          label: "百度APP ID",
          component: "Input",
          componentProps: {
            placeholder: "请输入百度翻译APPID",
            maxlength: 17,
            pattern: "^[0-9]*$",
            visible: true,
          },
        },
        {
          field: "baidu_translate.appkey",
          label: "百度Secret Key",
          component: "InputPassword",
          componentProps: {
            placeholder: "请输入百度翻译APPKEY",
            maxlength: 20,
            visible: false,
          },
        },
        {
          field: "youdao_translate.appid",
          label: "有道APP ID",
          component: "Input",
          componentProps: {
            placeholder: "请输入有道翻译APPID",
            maxlength: 16,
            visible: true,
          },
        },
        {
          field: "youdao_translate.appkey",
          label: "有道Secret Key",
          component: "InputPassword",
          componentProps: {
            placeholder: "请输入有道翻译APPKEY",
            maxlength: 32,
            visible: false,
          },
        },
        {
          component: "Divider",
          label: "其他 相关配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "huggingface_token",
          label: "Huggingface Token",
          component: "Input",
          componentProps: {
            placeholder: 'HuggingFace Token',
          },
        },
        {
          field: "botton_row",
          label: "单行按钮数量",
          component: "Select",
          componentProps: {
            options: [
              { label: '一个按钮', value: 1 },
              { label: '两个按钮', value: 2 },
              { label: '三个按钮', value: 3 },
              { label: '四个按钮', value: 4 },
              { label: '五个按钮', value: 5 },
            ],
          },
        },
        {
          field: "debug",
          label: "调试模式",
          component: "Switch",
        },
      ],
      getConfigData() {
        let config = Config.getConfig()
        return config
      },

      setConfigData(data, { Result }) {
        let config = {}
        for (let [keyPath, value] of Object.entries(data)) {
          lodash.set(config, keyPath, value)
        }
        config = lodash.merge({}, Config.getConfig(), config)
        config.proxy_url = config.proxy_url.replace(/\/$/, '')
        Config.setConfig(config)
        return Result.ok({}, '保存成功~')
      },
    },
  }
}
