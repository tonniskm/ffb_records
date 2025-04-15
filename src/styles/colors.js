export const posColors = {'QB':'blue','RB':'green','WR':'orange','TE':'gold','D/ST':'gray','K':'purple','NA':''}

export function valueToColor(value) {
    const min = -10;
    const max = 5;
  
    if (value === 0) {
      return 'rgb(255, 255, 255)';
    }
  
    let r = 255, g = 255, b = 255;
  
    if (value < 0) {
      // Fade from white to dark red
      const t = Math.min(1, Math.abs(value) / Math.abs(min)); // normalized to [0,1]
      r = 255;
      g = Math.round(255 * (1 - t));
      b = Math.round(255 * (1 - t));
    } else {
      // Fade from white to dark green
      const t = Math.min(1, value / max); // normalized to [0,1]
      r = Math.round(255 * (1 - t));
      g = 255;
      b = Math.round(255 * (1 - t));
    }
  
    return `rgb(${r},${g},${b})`;
  }
  
  