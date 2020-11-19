//app.js
App({
  showSettingToast: function (e) {
    // debugger
    // wx.showModal({
    //   title: '提示！',
    //   confirmText: '去设置',
    //   showCancel: false,
    //   content: "是否授权",
    //   success: function (res) {
    //     if (res.confirm) {
    //       wx.navigateTo({
    //         url: '../setting/setting',
    //       })
    //     }
    //   }
    // })
  },
  login: function () {
    wx.login({
      success: (res) => {
        this.globalData.code = res.code;
        this.getConfig();
        wx.navigateTo({
          url: "../index/index",
        });
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    });
  },
  onLaunch: function () {
    var _this = this;
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // var accountInfo = wx.getAccountInfoSync();
    // a2ecb26b08bd03411a132ff1ec08b981

    // 登录

    //检查登录态是否过期。
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
        _this.getConfig();
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        // wx.login().then((res) => console.log(res, "====login")); //重新登录
        _this.login();
      },
    });

    // 获取用户信息
    /**
     * 1. 先获取用户是否授权，不授权就用临时code去使用
     * 2. 用户授权后，获取用户信息，并且拿到用户的openid
     * 3. 请求历史记录
     * 4. 正常渲染页面
     */
  },
  getConfig() {
    wx.getSetting({
      success: (res) => {
        // res.authSetting["scope.userInfo"] = false;
        if (res.authSetting["scope.userInfo"]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: (res) => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res);
              }
            },
          });
          wx.navigateTo({
            url: "../index/index",
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
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
  },
});
