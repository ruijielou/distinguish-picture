//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    image: '/assets/placeholder.jpg',
    logImage: '/assets/syslogs.svg',
    showTips: false,
    result: null
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
   /**
   * 分析照片
   */
  detectImage (src) {
    const that = this

    // 取消之前的结果显示
    that.setData({ result: null })

    // loading
    wx.showLoading({ title: '分析中...' })

    // wx.request({
    //   url: 'test.php', //仅为示例，并非真实的接口地址
    //   data: {
    //     x: '',
    //     y: ''
    //   },
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   success (res) {
    //     console.log(res.data)
    //   }
    // })
    
    // 将图片上传至 AI 服务端点
    wx.uploadFile({
      url: 'https://ai.qq.com/cgi-bin/appdemo_detectface',
      name: 'image_file',
      filePath: src,
      success (res) {
        // 解析 JSON
        const result = JSON.parse(res.data)

        if (result.ret === 0) {
          // 成功获取分析结果
          that.setData({ result: result.data.face[0] })
        } else {
          // 检测失败
          wx.showToast({ icon: 'none', title: '找不到你的小脸蛋' })
        }
        // end loading
        wx.hideLoading()
      }
    })
  },

  /**
   * 获取照片
   */
  getImage () {
    const that = this

    // 调用系统 API 选择或拍摄照片
    wx.chooseImage({
      sourceType: ["camera", "album"], // camera | album
      sizeType: ['compressed'], // original | compressed
      count: 1,
      success (res) {
        // 取照片对象
        const image = res.tempFiles[0]

        // 图片过大
        if (image.size > 1024 * 1000) {
          return wx.showToast({ icon: 'none', title: '图片过大, 请重新拍张小的！' })
        }

        // 显示到界面上
        that.setData({ image: image.path })

        // 分析检测人脸
        that.detectImage(image.path)
      }
    })

    // 关闭 Tips 显示
    this.setData({ showTips: false })
  },
  onLoad: function () {
    const isUsed = wx.getStorageSync('is_used')
    if (isUsed) return
    // 第一次使用显示 Tips
    this.setData({ showTips: true })
    // 并记住用使用过了
    wx.setStorageSync('is_used', true)
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  /**右上角点击分享 */
  onShareAppMessage () {
    if (!this.data.result) return
    // 如果有分析结果，则分享
    return { title: `刚刚测了我的颜值「${this.data.result.beauty}」你也赶紧来试试吧！` }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
