import Config from './Config.js';

export async function makeButton(data, id) {
    const count = await Config.getConfig().button_row;

    if (count === 0) {
        const totalLength = data.join('').length;
        const groupSize = Math.ceil(totalLength / 5);

        let groups = [];
        let currentGroup = [];
        let currentGroupLength = 0;

        data.forEach((item) => {
            if (currentGroupLength + item.length > groupSize && currentGroup.length > 0) {
                const overflowLength = currentGroupLength + item.length - groupSize;
                groups.push(segment.button(currentGroup));
                currentGroup = [];
                currentGroupLength = -overflowLength;
            }

            currentGroup.push({ text: item, callback: `#mj按钮${item}${id ? ` ${id}` : ''}` });
            currentGroupLength += item.length;
        });

        if (currentGroup.length > 0) {
            groups.push(segment.button(currentGroup));
        }

        return groups;
    } else {

        const result = [];

        for (let i = 0; i < data.length; i += count) {
            const buttons = data.slice(i, i + count).map(item => ({
                text: item,
                callback: `#mj按钮${item}${id ? ` ${id}` : ''}`
            }));

            result.push(segment.button(buttons));
        }
        return result;
    }
}