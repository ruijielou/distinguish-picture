const app = getApp();

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
  onLoad: function () {
    this.getConfig();
  },
  // onShow: function () {
  //   this.getConfig();
  // },
  async getConfig() {
    console.log("getConfig");
    await wx.getSetting({
      success: (r) => {
        if (r.authSetting["scope.userInfo"]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框

          wx.getUserInfo({
            success: (res) => {
              // 可以将 res 发送给后台解码出 unionId
              app.globalData.userInfo = res.userInfo;

              wx.navigateTo({
                url: "../home/home",
              });
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
});
