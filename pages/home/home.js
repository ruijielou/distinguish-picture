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
    loading: false,
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: "../logs/logs",
    });
  },
  clearData() {
    const that = this;
    if (that.data.loading) return;
    that.setData({
      result: "",
      image: "",
    });
  },
  // getOpenId: function (code) {
  //   if (!code) return;
  //   const that = this;
  //   wx.request({
  //     url:
  //       "http://192.168.0.130:8080/auth/code2Session?code=" + code, //仅为示例，并非真实的接口地址

  //     header: {
  //       "content-type": "application/json", // 默认值
  //     },
  //     success(res) {
  //       if (res.data.code == 200 && res.data.data) {
  //         wx.setStorageSync("openId", res.data.data);
  //         that.getTotal(res.data.data);
  //       } else {
  //         wx.showToast({
  //           title: "获取用户id失败，检查服务器连接状态",
  //           icon: "warning",
  //           duration: 2000,
  //         });
  //       }
  //     },
  //   });
  // },
  /**
   * 分析照片
   */
  detectImage(src) {
    const that = this;
    // 取消之前的结果显示
    that.setData({ result: null });
    // loading
    this.setData({ loading: true });
    wx.showLoading({ title: "分析中..." });
    // multipartFile
    // 将图片上传至 AI 服务端点
    try {
      wx.uploadFile({
        url: `http://192.168.0.130:8080/ticket/createItem?wxOpenId=${app.globalData.openId}`,
        filePath: src,
        header: {
          "Content-Type": "multipart/form-data",
        },
        name: "multipartFile",
        success(res) {
          let toast = {
            icon: "none",
            title: "",
            duration: 3000,
          };

          if (res.data) {
            console.log("解析图片成功", res.data);
            // 成功获取分析结果
            const result = JSON.parse(res.data);
            if (result.code == 200) {
              if (result.data) {
                that.setData({ result: result.data });
                toast.title = result.msg || "识别成功";
              } else {
                toast.title = result.msg || "无效图片";
              }
            } else {
              // 检测失败
              console.log(JSON.stringify(result));
              toast.title = JSON.stringify(result);
            }
          } else {
            // 检测失败
            toast.title = "解析图片失败";
          }
          // end loading
          wx.hideLoading();

          if (toast.title) {
            wx.showToast(toast);
          }
          that.setData({ loading: false });
        },
        fail(err) {
          wx.hideLoading();
          wx.showToast({ icon: "warn", title: "服务器异常", duration: 2000 });
        },
      });
    } catch (error) {
      wx.showToast({ icon: "none", title: error, duration: 2000 });
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
    const {openId, userInfo} = app.globalData;
    const that = this;
    if (openId) {
      that.getTotal(openId);
    } else {
      wx.showToast({
        title: "没有授权获取到用户id",
        icon: "none",
        duration: 2000,
      });
    }
  
    const isUsed = wx.getStorageSync("is_used");
    if (isUsed) return;
    // 并记住用使用过了
    wx.setStorageSync("is_used", true);
    if (userInfo) {
      that.setData({
        userInfo: userInfo,
        hasUserInfo: true,
      });
    } else if (app.globalData.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = (res) => {
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        });
      };
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: (res) => {
          app.globalData.userInfo = res.userInfo;
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
          });
        },
      });
    }
  },
  getTotal: function (openId) {
    const that = this;
    // /ticket/getSumIntegral
    wx.request({
      url: `http://192.168.0.130:8080/ticket/getSumIntegral?wxOpenId=${openId || app.globalData.openId}`,
      method: "POST",
      header: {
        "content-type": "application/json", // 默认值
      },
      success(res) {
        if (res.data.code == 200) {
          that.setData({
            allScore: res.data.data,
          });
        } else {
          wx.showToast({
            title: "获取总积分失败，检查服务器连接状态",
            icon: "warn",
            duration: 2000,
          });
        }
      },
    });
  },
  login: function () {
    const that = this;
    wx.login({
      success: (res) => {
        app.globalData.code = res.code;

        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        const openId = wx.getStorageSync("openId");
        if (!openId) {
          that.getOpenId(res.code);
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
