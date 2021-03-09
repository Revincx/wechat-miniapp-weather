// app.js
App({
  // 天气相关接口的API密钥，此处已全部换为xxxxx，如需运行请自行申请密钥
  tianqiApi: {
    // 百度地图API Key
    baiduMapApiKey: 'xxxxx',
    // 天气API的appid和appsecret 
    // https://www.tianqiapi.com/
    appid: 'xxxxx',
    appsecret: 'xxxxx',
    // 和风天气接口的ApiKey
    // https://dev.qweather.com/
    heweatherApiKey: "xxxxx",
  },
  onLaunch() {
    console.log('App Launched');
  },
  globalData: {}
})