import fetch from 'node-fetch'
import crypto from 'crypto'
import Log from './logs.js'
import Config from '../components/Config.js'
import lodash from 'lodash'

class Translate {
  translate (msg) {
    if (Config.getConfig().translate_use == 1) {
      return BaiduTranslate(msg)
    } else if (Config.getConfig().translate_use == 2) {
      return YoudaoTranslate(msg)
    } else {
      return yenai_youdao(msg)
    }
  }
}

async function BaiduTranslate (msg) {
  const translateAPI = 'http://api.fanyi.baidu.com/api/trans/vip/translate'
  const salt = Math.random().toString(36).substr(2)
  const sign = crypto
    .createHash('md5')
    .update(
      (await Config.getConfig()).baidu_translate.appid +
        msg +
        salt +
        (await Config.getConfig()).baidu_translate.appkey
    )
    .digest('hex')
  const url = `${translateAPI}?q=${msg}&from=zh&to=en&appid=${
    (await Config.getConfig()).baidu_translate.appid
  }&salt=${salt}&sign=${sign}`
  const res = await fetch(url)
  const json = await res.json()
  try {
    if (json.error_code) {
      Log.i('百度翻译报错:', json)
      return false
    }
    return json.trans_result[0].dst
  } catch (err) {
    Log.e('百度翻译报错:', err)
    return false
  }
}

async function YoudaoTranslate (msg) {
  const translateAPI = 'https://openapi.youdao.com/api'
  const len = msg.length
  if (len > 20) {
    var input = msg.substring(0, 10) + len + msg.substring(len - 10, len)
  } else {
    var input = msg
  }
  const salt = new Date().getTime()
  const curtime = Math.round(new Date().getTime() / 1000)
  const sign = crypto
    .createHash('sha256')
    .update(
      (await Config.getConfig()).youdao_translate.appid +
        input +
        salt +
        curtime +
        (await Config.getConfig()).youdao_translate.appkey
    )
    .digest('hex')
  const url = `${translateAPI}?appKey=${
    (await Config.getConfig()).youdao_translate.appid
  }&q=${msg}&from=auto&to=en&salt=${salt}&sign=${sign}&signType=v3&curtime=${curtime}`
  const res = await fetch(url)
  const json = await res.json()
  try {
    if (json.errorCode != 0) {
      Log.i('有道翻译报错:', json)
      return false
    }
    return json.translation[0]
  } catch (err) {
    Log.e('有道翻译报错:', err)
    return false
  }
}

async function yenai_youdao (msg) {
  const qs = (obj) => {
    let res = ''
    for (const [k, v] of Object.entries(obj)) {
      res += `${k}=${encodeURIComponent(v)}&`
    }
    return res.slice(0, res.length - 1)
  }
  const appVersion = '5.0 (Windows NT 10.0; Win64; x64) Chrome/98.0.4750.0'
  const payload = {
    from: 'AUTO',
    to: 'AUTO',
    bv: crypto.createHash('md5').update(appVersion, 'utf-8').digest('hex'),
    client: 'fanyideskweb',
    doctype: 'json',
    version: '2.1',
    keyfrom: 'fanyi.web',
    action: 'FY_BY_DEFAULT',
    smartresult: 'dict'
  }
  const headers = {
    Host: 'fanyi.youdao.com',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/98.0.4758.102',
    Referer: 'https://fanyi.youdao.com/',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Cookie:
      'OUTFOX_SEARCH_USER_ID_NCOO=133190305.98519628; OUTFOX_SEARCH_USER_ID="2081065877@10.169.0.102";'
  }
  const api =
    'https://fanyi.youdao.com/translate_o?smartresult=dict&smartresult=rule'
  const key = 'Ygy_4c=r#e#4EX^NUGUc5'

  const i = msg
  const lts = '' + new Date().getTime()
  const salt = lts + parseInt(String(10 * Math.random()), 10)
  const sign = crypto
    .createHash('md5')
    .update(payload.client + i + salt + key, 'utf-8')
    .digest('hex')
  const postData = qs(Object.assign({ i, lts, sign, salt }, payload))
  try {
    let { errorCode, translateResult } = await fetch(api, {
      method: 'POST',
      body: postData,
      headers
    })
      .then((res) => res.json())
      .catch((err) => Log.e(err))
    if (errorCode != 0) return false
    translateResult = lodash
      .flattenDeep(translateResult)
      ?.map((item) => item.tgt)
      .join('\n')
    if (!translateResult) return false
    return translateResult
  } catch (e) {
    Log.e('椰奶有道翻译报错:', e)
    return false
  }
}

export default new Translate()
