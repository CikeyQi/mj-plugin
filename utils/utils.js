import config from "../components/config/config";

/**
 * 处理消息中的图片：当消息引用了图片，或者消息有@对象，则将对应图片放入e.img ，优先级==> e.source.img > e.img > e.at的头像 > bot头像
 * @return {*} 处理过后的e
 */
export async function parseImg(e) {
    if (e.msg && e.msg.includes('自己')) {
        e.img = [`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`]
        e.msg = e.msg.replace('自己', '')
    }
    if (!e.img) {
        if (e.atBot) {
            let setting = await config.getSetting()
            if (setting.shield) {
                delete e.img;
            } else {
                e.img = [];
                e.img[0] = e.bot.avatar || `https://q1.qlogo.cn/g?b=qq&s=0&nk=${Bot.uin}`;
            }
        }
        if (e.at) {
            try {
                e.img = [await e.group.pickMember(e.at).getAvatarUrl()]
            } catch (error) {
                e.img = [`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.at}`];
            }
        }
    }
    if (e.source) {
        let reply;
        if (e.isGroup) {
            reply = (await e.group.getChatHistory(e.source.seq, 1)).pop()?.message;
        } else {
            reply = (await e.friend.getChatHistory(e.source.time, 1)).pop()?.message;
        }
        if (reply) {
            for (let val of reply) {
                if (val.type == "image") {
                    e.img = [val.url];
                    break;
                }
            }
        }
    }
    return e
}

/**获取base64的大小 返回一个数组，依次是[b,kb,mb]；
 * @param {string} base64 
 * @param {boolean} isunit 是否带单位，默认false
 * @param {number} tofix 保留小数的位数,默认两位
 * @return {array}
 */
export function bs64Size(base64, isunit = false, tofix = 2) {
    let strLength = base64.length;
    let b = parseInt(strLength - (strLength / 8) * 2);
    let size = [
        b,
        b / 1000,
        b / 1000 / 1000
    ]
    size.forEach((value, index) => size[index] = Number(value.toFixed(tofix)))
    if (isunit)
        size.forEach((value, index) => size[index] = value + (index == 0 ? "b" : index == 1 ? 'kb' : 'mb'))
    return size
}

/**
 * 获取指定用户的昵称。
 * 优先返回其在群内的名片，其次返回其QQ昵称，二者都空时返回QQ号
 * @param qq  指定的QQ号
 * @return {string} 获取到的昵称
 */
export async function getuserName(e, qq = null) {
    qq = qq || e.user_id
    if (e && e.isGroup) {
        try {
            let member = await Bot.getGroupMemberInfo(e.group_id, qq);
            if (member != undefined) {
                let name = member.card || member.nickname || qq;
                return String(name)
            }
        } catch (err) {
            return (await e.group.pickMember(qq).getInfo()).nickname
        }
    }
    let user
    try {
        user = (await Bot.pickUser(qq).getSimpleInfo()).nickname
    } catch (error) {
        user = (await e.bot.pickUser(qq).getInfo()).nickname
    }
    return String(user || qq);
}

/**将文本中的中文数字修改为阿拉伯数字
 * @param {string} text 待修改的文本
 * @param {string} data.regExp  当语句情况比较复杂时，可以根据语境手动指定正则表达式。中文数字推荐用 (\\\[一二三四五六七八九十零百千万亿\\\]\\\+) 来匹配
 * @param {string} data.l_text  数字左边的固定文本
 * @param {string} data.r_text  数字右边的固定文本。此二者可以用于更精准地定位要修改的数字，避免误伤。当指定了data.regExp时此二者无效
 * @return {string} 修改后的文本
 */
export function chNum2Num(text, data = {}) {
    if (!('l_text' in data))
        data['l_text'] = ''
    if (!('r_text' in data))
        data['r_text'] = ''
    if (!('regExp' in data))
        data['regExp'] = ''

    let regExp
    if (data.regExp)
        regExp = new RegExp(data.regExp)
    else {
        regExp = new RegExp(data.l_text + '(\[一二三四五六七八九十零百千万亿\]\+)' + data.r_text)
    }
    let ret = regExp.exec(text)
    if (!ret) return text
    let chNum = ret[1].trim()
    let enNum = numberDigit(chNum)
    if (enNum == -1) return text
    return text.replace(chNum, enNum)
}
// 解析失败返回-1，成功返回转换后的数字，不支持负数
function numberDigit(chinese_number) {
    var map = {
        "零": 0,

        "一": 1,
        "壹": 1,

        "二": 2,
        "贰": 2,
        "两": 2,

        "三": 3,
        "叁": 3,

        "四": 4,
        "肆": 4,

        "五": 5,
        "伍": 5,

        "六": 6,
        "陆": 6,

        "七": 7,
        "柒": 7,

        "八": 8,
        "捌": 8,

        "九": 9,
        "玖": 9,

        "十": 10,
        "拾": 10,

        "百": 100,
        "佰": 100,

        "千": 1000,
        "仟": 1000,

        "万": 10000,
        "十万": 100000,
        "百万": 1000000,
        "千万": 10000000,
        "亿": 100000000
    };

    var len = chinese_number.length;
    if (len == 0) return -1;
    if (len == 1) return (map[chinese_number] <= 10) ? map[chinese_number] : -1;
    var summary = 0;
    if (map[chinese_number[0]] == 10) {
        chinese_number = "一" + chinese_number;
        len++;
    }
    if (len >= 3 && map[chinese_number[len - 1]] < 10) {
        var last_second_num = map[chinese_number[len - 2]];
        if (last_second_num == 100 || last_second_num == 1000 || last_second_num == 10000 || last_second_num == 100000000) {
            for (var key in map) {
                if (map[key] == last_second_num / 10) {
                    chinese_number += key;
                    len += key.length;
                    break;
                }
            }
        }
    }
    if (chinese_number.match(/亿/g) && chinese_number.match(/亿/g).length > 1) return -1;
    var splited = chinese_number.split("亿");
    if (splited.length == 2) {
        var rest = splited[1] == "" ? 0 : numberDigit(splited[1]);
        return summary + numberDigit(splited[0]) * 100000000 + rest;
    }
    splited = chinese_number.split("万");
    if (splited.length == 2) {
        var rest = splited[1] == "" ? 0 : numberDigit(splited[1]);
        return summary + numberDigit(splited[0]) * 10000 + rest;
    }
    var i = 0;
    while (i < len) {
        var first_char_num = map[chinese_number[i]];
        var second_char_num = map[chinese_number[i + 1]];
        if (second_char_num > 9)
            summary += first_char_num * second_char_num;
        i++;
        if (i == len)
            summary += first_char_num <= 9 ? first_char_num : 0;
    }
    return summary;
}

/**
 * 休眠函数
 * @param ms 毫秒
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
