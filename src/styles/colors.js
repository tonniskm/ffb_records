export const posColors = {'QB':'#2C5DA3','RB':'green','WR':'#BF6C07','TE':'#CEDC00','D/ST':'#505050','K':'purple','NA':'white'}

export function valueToColor(value, min, max, center) {
    if (value === center) {
      return 'rgb(255, 255, 255)';
    }
  
    let r = 255, g = 255, b = 255;
  
    if (value < center) {
      // Fade from white to dark red
      const t = Math.min(1, Math.abs(value - center) / Math.abs(min - center));
      r = 255;
      g = Math.round(255 * (1 - t));
      b = Math.round(255 * (1 - t));
    } else {
      // Fade from white to dark green
      const t = Math.min(1, Math.abs(value - center) / Math.abs(max - center));
      r = Math.round(255 * (1 - t));
      g = 255;
      b = Math.round(255 * (1 - t));
    }
  
    return `rgb(${r},${g},${b})`;
  }
  