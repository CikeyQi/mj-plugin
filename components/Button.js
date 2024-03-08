import Config from './Config.js';

export async function makeButton(data, id) {
  const count = await Config.getConfig().button_row;
  
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