// index.js
import {
  getIconText
} from '../../utils/util.js'

Page({
  // 页面数据部分
  data: {
    navHeight: 40, // 默认导航栏高度
    // 默认字符串
    city: '加载中...', // 默认标题城市
    temp: '5', // 默认温度
    statusBarHeight: 20, // 默认状态栏高度
    icon: "", // 主天气图标
    weather: [], // 主显示天气信息
    sevenDayWeather: [], // 七日天气信息
    threeDayWeather: [], // 三日天气信息
    air: { // 空气信息
      aqi: '',
      level: '',
      desp: ''
    },
    navbarItem: [{ // 底部导航栏
      index: 1,
      icon: 'cloud',
      text: '天气',
      active: 'active',
      animation: ''
    }, {
      index: 2,
      icon: 'apartment',
      text: '位置',
      active: '',
      animation: ''
    }],
    cards: [], // 天气指数卡片信息
    currentPage: 0, // 目前所在的页面
    location: { // 位置信息
      latitude: '',
      longitude: '',
      country: '',
      province: '',
      city: '',
      district: '',
      details: ''
    },
    updateTime: '', // 天气更新时间
    initTime: 0, // 进入小程序时的时间
    refreshTriggered: false, // 是否正在刷新
    hasRefreshed: false, // 15秒内是否已经刷新过
    hideAndShow: '查看' // 查看七日天气按钮按钮文字
  },
  // 刷新天气函数
  refresh: function () {
    var _this = this
    // 判断15秒内是否刷新过，防止用户频繁刷新
    if (this.data.hasRefreshed) {
      wx.showToast({
        title: '刚刚已经刷新过啦～',
        icon: 'none',
        duration: 2000
      })
      this.setData({
        refreshTriggered: false
      })
    } else {
      // 刷新天气
      this.setData({
        hasRefreshed: true,
        refreshTriggered: true
      })
      // 指定调用的动作为刷新
      this.getLocation('REFRESH')
      // 倒计时15秒
      setTimeout(function () {
        _this.setData({
          hasRefreshed: false
        })
      }, 15000)
    }
  },
  // 设置导航栏和状态栏高度
  setUpDimens: function () {
    let menuBtn = wx.getMenuButtonBoundingClientRect()
    // 获取状态栏高度
    var statusHeight = wx.getSystemInfoSync().statusBarHeight
    // 获取导航栏高度
    var navHeight = (menuBtn.top - statusHeight) * 2 + menuBtn.height
    this.setData({
      statusBarHeight: statusHeight,
      navHeight: navHeight
    })
  },
  // 加载页面
  onLoad() {
    this.setUpDimens()
    // 显示加载中弹窗
    wx.showLoading({
      title: '(ﾉ*･ω･)ﾉ',
      mask: true
    })
    // 获取当前毫秒级时间
    this.setData({
      initTime: Date.now()
    })
    // 获取并显示天气信息
    // 指定调用的动作为初次加载
    this.getLocation('INIT')
  },
  // 获取位置信息函数
  getLocation: function (action) {
    var _this = this
    // 调用微信接口获取经纬度
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        console.log('经纬度信息:')
        console.log(res)
        var lat = res.latitude
        var lng = res.longitude
        // 发起网络请求，通过经纬度获取位置信息
        wx.request({
          url: 'https://api.map.baidu.com/geocoder/v2/',
          data: {
            location: lat + ',' + lng,
            output: 'json',
            pois: '1',
            ak: getApp().tianqiApi.baiduMapApiKey
          },
          success(res) {
            console.log('位置信息:')
            console.log(res.data.result)
            var address = res.data.result.addressComponent
            // 显示位置信息
            _this.setData({
              location: {
                latitude: lat,
                longitude: lng,
                country: address.country,
                province: address.province,
                city: address.city,
                district: address.district,
                details: res.data.result.formatted_address
              },
              city: address.city + ' ' + address.district
            })
            // 调用获取天气函数
            _this.getWeather(address.city, action)
          }
        })
      }
    })
  },
  // 获取天气函数
  getWeather: function (city, action) {
    // 因为接口限制，这里要裁切城市名
    city = city.substring(0, city.length - 1)
    var _this = this
    // 发起网络请求，获取当前天气
    wx.request({
      url: 'https://tianqiapi.com/api',
      data: {
        version: 'v6',
        appid: getApp().tianqiApi.appid,
        appsecret: getApp().tianqiApi.appsecret,
        city: city
      },
      success(weather) {
        console.log('天气API-当前天气:')
        console.log(weather.data)
        // 展示当前天气温度和天气更新时间
        _this.setData({
          temp: weather.data.tem,
          updateTime: weather.data.update_time.split(' ')[1]
        })
      },
      fail(res) {
        console.log('调用天气接口失败')
        console.log(res.data)
      }
    })
    // 发起网络请求，获取七日内天气
    wx.request({
      url: 'https://tianqiapi.com/api',
      data: {
        version: 'v1',
        appid: getApp().tianqiApi.appid,
        appsecret: getApp().tianqiApi.appsecret,
      },
      success(res) {
        var weathers = res.data.data
        console.log('天气API-七日天气:')
        console.log(res.data.data)
        var localWeathers = []
        // 使用循环将返回的数据进行转换
        for (let w of weathers) {
          localWeathers.push({
            // 获取天气对应图标
            icon: getIconText(w.wea_img),
            // 这一句是获取天气具体对应的哪一天，接口返回的结果太长了，我裁切了一下
            day: w.day.substring(w.day.indexOf('（') + 1, w.day.indexOf('）')),
            text: w.wea,
            max_temp: w.tem1.substring(0, w.tem1.length - 1),
            min_temp: w.tem2.substring(0, w.tem2.length - 1)
          })
        }
        // 保存获取的七日内天气
        _this.setData({
          sevenDayWeather: localWeathers
        })
        var threeDayWeather = []
        for (var i = 0; i <= 2; i++) {
          threeDayWeather.push(localWeathers[i])
        }
        // 默认显示三日内天气
        _this.setData({
          threeDayWeather: threeDayWeather
        })
      },
      fail(res) {
        console.log('调用天气接口失败')
        console.log(res.data)
      }
    })
    // console.log(city)
    // 发起网络请求，获取各种生活指数
    wx.request({
      url: 'https://free-api.heweather.com/v5/weather',
      data: {
        city: city,
        key: getApp().tianqiApi.heweatherApiKey
      },
      success(res) {
        var weather = res.data.HeWeather5[0]
        console.log('和风天气API:')
        console.log(weather)
        // 保存空气信息
        var air = {
          aqi: weather.aqi.city.aqi,
          level: weather.aqi.city.qlty,
          desp: weather.suggestion.air.txt
        }
        // 显示空气质量信息
        _this.setData({
          air: air
        })
        // 显示各种生活指数
        var cards = [{
            title: '空气质量指数',
            content: air.aqi + ' • ' + air.level,
            description: air.desp
          }, {
            title: '舒适指数',
            content: weather.suggestion.comf.brf,
            description: weather.suggestion.comf.txt
          },
          {
            title: '洗车指数',
            content: weather.suggestion.cw.brf,
            description: weather.suggestion.cw.txt
          },
          {
            title: '穿衣指数',
            content: weather.suggestion.drsg.brf,
            description: weather.suggestion.drsg.txt
          }, {
            title: '流感指数',
            content: weather.suggestion.flu.brf,
            description: weather.suggestion.flu.txt
          }, {
            title: '运动指数',
            content: weather.suggestion.sport.brf,
            description: weather.suggestion.sport.txt
          }
        ]
        _this.setData({
          cards: cards
        })
        // 至此，所有接口已经调用完成
        var title = ''
        // 判断调用的动作是刷新还是初次加载
        switch (action) {
          case 'INIT':
            wx.hideLoading()
            // 计算加载耗时并显示
            title = '加载完毕，耗时' + (Date.now() - _this.data.initTime) + '毫秒'
            var newNavBarItem = _this.data.navbarItem
            newNavBarItem[0].animation = 'fade-in'
            _this.setData({
              weather: _this.data.threeDayWeather,
              // 加载动画
              navbarItem: newNavBarItem
            })
            // 切换到默认页面
            setTimeout(function () {
              _this.setData({
                currentPage: 1
              })
            }, 200)
            break
          case 'REFRESH':
            // 将状态设置为停止刷新
            _this.setData({
              refreshTriggered: false
            })
            // 判断当前显示的是几日天气
            if (_this.data.weather.length == 3) {
              _this.setData({
                weather: _this.data.threeDayWeather
              })
            } else {
              _this.setData({
                weather: _this.data.sevenDayWeather
              })
            }
            title = '天气与位置信息已刷新～'
            break
        }
        // 显示加载完毕的提示
        wx.showToast({
          title: title,
          icon: 'none',
          duration: 2000
        })
      },
      fail(res) {
        console.log('调用和风天气接口失败')
        console.log(res)
      }
    })
  },
  // 切换底部tab和页面
  switchTab: function (event) {
    var _this = this
    // 获取被点击的tab的ID
    var id = Number.parseInt(event.currentTarget.id.split('-')[1])
    var newNavBarItem = this.data.navbarItem
    // 取消激活所有的tab
    for (var i = 0; i < newNavBarItem.length; i++) {
      newNavBarItem[i].active = ''
    }
    // 更新页面淡出与淡入的动画
    newNavBarItem[this.data.currentPage - 1].animation = 'fade-out'
    newNavBarItem[id].animation = 'fade-in'
    // 激活被点击的tab
    newNavBarItem[id].active = 'active'
    this.setData({
      navbarItem: newNavBarItem
    })
    // 动画加载完毕后切换到对应的页面
    setTimeout(function () {
      _this.setData({
        currentPage: id + 1
      })
    }, 200)
  },
  // 显示或隐藏七日内天气
  showAndHide: function () {
    // 改变按钮文字
    if (this.data.hideAndShow == '查看') {
      this.setData({
        hideAndShow: '隐藏',
        weather: this.data.sevenDayWeather
      })
    } else {
      this.setData({
        hideAndShow: '查看',
        weather: this.data.threeDayWeather
      })
    }
  }
})

// Code by Revincx