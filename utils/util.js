const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const getIconText = name => {
  switch (name) {
    case 'qing':
      return ''
      // var date = new Date();
      // if (date.getHours() > 5 && date.getHours() < 19) {
      //   return ''
      // } else {
      //   return ''
      // }
      break;
    case 'yun':
      return '';
      // var date = new Date();
      // if (date.getHours() > 5 && date.getHours() < 19) {
      //   return '';
      // } else {
      //   return '';
      // }
      break;
    case 'yin':
      return '';
      break;
    case 'yu':
      return '';
      break;
    case 'lei':
      return '';
      break;
    case 'xue':
      return '';
      break;
    case 'wu':
      return '';
      break;
    case 'shachen':
      return '';
      break;
    case 'bingbao':
      return '';
      break;
    default:
      return '';
      break;
  }
}

module.exports = {
  formatTime,
  getIconText
}