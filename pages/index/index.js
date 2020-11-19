//index.js
//获取应用实例
const app = getApp();
console.log(app, "=====app");
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    image: "",
    logImage: "/assets/syslogs.svg",
    result: "",
    allScore: 0,
    loading: false
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: "../logs/logs",
    });
  },
  clearData() {
    const that = this
    console.log(that);
    debugger
    if(that.data.loading) return
    that.setData({
      result: "",
      image: ""
    })
  },
  getOpenId:function() {
    wx.request({
      url:
        "http://192.168.0.130:8080/auth/code2Session?code=" +
        app.globalData.code, //仅为示例，并非真实的接口地址

      header: {
        "content-type": "application/json", // 默认值
      },
      success(res) {
        if (res.data.code == 200) {
          wx.setStorageSync("openId", res.data.data);
          this.getTotal();
        } else {
          wx.showToast({
            title: "获取用户id失败，检查服务器连接状态",
            icon: "warning",
            duration: 2000,
          });
        }
      },
    });
  },
  /**
   * 分析照片
   */
  detectImage(src) {
    const that = this;
    // 取消之前的结果显示
    that.setData({ result: null });
    // loading
    this.setData({loading: true})
    wx.showLoading({ title: "分析中..." });
    // multipartFile
    // 将图片上传至 AI 服务端点
    try {
      wx.uploadFile({
        url:
          "http://192.168.0.130:8080/ticket/createItem?wxOpenId=" +
          app.globalData.openId,
        filePath: src,
        header: {
          "Content-Type": "multipart/form-data",
        },
        name: "multipartFile",
        success(res) {
          
          if (res.data) {
            console.log('解析图片成功');
            // 成功获取分析结果
            const result = JSON.parse(res.data)
            if (result.data && result.code == 200) {
              that.setData({ result: result.data });
            } else {
              // 检测失败
              wx.showToast({ icon: "none", title: "您上传的是无效图片" });
            }
          } else {
            // 检测失败
            wx.showToast({ icon: "none", title: "解析图片失败" });
          }
          // end loading
          wx.hideLoading();
          that.setData({loading: false})
        },
      });
    } catch (error) {
      wx.showToast({ icon: "none", title: error });
    }
  },

  /**
   * 获取照片
   */
  getImage() {
    const that = this;

    // 调用系统 API 选择或拍摄照片
    wx.chooseImage({
      sourceType: ["camera", "album"], // camera | album
      sizeType: ["compressed"], // original | compressed
      count: 1,
      success(res) {
        // 取照片对象
        console.log(res, "tup");
        const image = res.tempFiles[0];

        // 图片过大
        if (image.size > 1024 * 1000) {
          return wx.showToast({
            icon: "none",
            title: "图片过大, 请重新拍张小的！",
          });
        }

        // 显示到界面上
        that.setData({ image: image.path });

        // 分析检测人脸
        that.detectImage(image.path);
      },
    });
  },
  onLoad: function () {
    const openId = wx.getStorageSync("openId");
    if (openId) {
      app.globalData.openId = openId;
      this.getTotal();
    } else {
      this.getOpenId();
    }
    const isUsed = wx.getStorageSync("is_used");
    if (isUsed) return;
    // 并记住用使用过了
    wx.setStorageSync("is_used", true);
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
      });
    } else if (app.globalData.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        });
      };
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: (res) => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
          });
        },
      });
    }
  },
  getTotal() {
    // /ticket/getSumIntegral
    wx.request({
      url:
        "http://192.168.0.130:8080/ticket/getSumIntegral?wxOpenId=" +
        app.globalData.openId,
      method: "POST",
      header: {
        "content-type": "application/json", // 默认值
      },
      success(res) {
        if (res.data.code == 200) {
          console.log(res.data);
        } else {
          wx.showToast({
            title: "获取总积分失败，检查服务器连接状态",
            icon: "warning",
            duration: 2000,
          });
        }
      },
    });
  },
  /**右上角点击分享 */
  onShareAppMessage() {
    if (!this.data.result) return;
    // 如果有分析结果，则分享
    return {
      title: `刚刚测了分析了我的小票「${this.data.result.beauty}」你也赶紧来试试吧！`,
    };
  },
});
