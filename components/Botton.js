import Config from './Config.js'

export async function makeBotton(data, id) {
    let res = []
    let i = 0
    while (i < data.length) {
        let temp = []
        for (let j = 0; j < Config.getConfig().button_raw; j++) {
            if (i < data.length) {
                temp.push({ text: data[i], callback: `#mj按钮${data[i]}${id ? ` ${id}` : ''}` })
                i++
            }
        }
        res.push(segment.button(temp))
    }
    return res
}
