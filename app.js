//app.js
App({

  onLaunch: function () {
    // this.getConfig();
    
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
    openId: wx.getStorageSync("openId"),
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
  },
});
