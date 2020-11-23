//app.js
App({

  onLaunch: function () {
    // this.getConfig();
    const that = this;
    wx.login({
      success: res => {
        if(res.code) {
          that.getOpenId(res.code)
        }
      }
    })
  },
  getOpenId: function (code) {
    if (!code) return;
    const that = this;
    wx.request({
      url:
        "http://192.168.0.130:8080/auth/code2Session?code=" + code, //仅为示例，并非真实的接口地址

      header: {
        "content-type": "application/json", // 默认值
      },
      success(res) {
        if (res.data.code == 200 && res.data.data) {
          // wx.setStorageSync("openId", res.data.data);
          that.globalData.openId = res.data.data
          // that.getTotal(res.data.data);
        } else {
          wx.showToast({
            title: "获取用户id失败",
            icon: "none",
            duration: 2000,
          });
        }
      },
    });
  },
  async getConfig() {
    await wx.getSetting({
      success: (r) => {
        // res.authSetting["scope.userInfo"] = false;
        console.log(r);
        if (r.authSetting["scope.userInfo"]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框

           wx.getUserInfo({
            success: (res) => {
              console.log(res, "user");
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res);
              }
            },
          });
        } else {
          wx.navigateTo({
            url: "../login/login",
          });
        }
      },
    });
  },
  onShow: function () {},
  globalData: {
    userInfo: null,
    appId: "",
    code: "",
    openId: "",
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
  },
});
