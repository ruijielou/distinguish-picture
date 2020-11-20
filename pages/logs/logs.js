//logs.js
import {formatTime} from "../../utils/util"
console.log(formatTime);
const app = getApp();
Page({
  data: {
    toView: 'green',
    logs: [],
    page: 0,
    total: 0,
    totalPages: 0,
    loading: false
  },
  onShow: function () {
    this.getLog();
  },
  lower(e) {
    
    if(this.data.loading) return
    
    
    if(this.data.logs.length >= this.data.total && this.data.logs.length != 0) return

    this.getLog();
  },
  getLog: function () {
    const that = this;
    const openId = wx.getStorageSync("openId");
    const currentPage = that.data.page + 1

    if(currentPage > this.data.totalPages && this.data.totalPages != 0) return

    const params = {
      k: "",
      page: currentPage,
      size: 20,
      wxOpenId: openId,
    };
    wx.showLoading({ title: "加载中..." });
    that.setData({
      loading: true
    })
    wx.request({
      url: "http://192.168.0.130:8080/ticket/getItems",
      method: "POST",
      header: {
        "content-type": "application/json", // 默认值
      },
      data: params,
      success(res) {
        
        if (res.data.code == 200) {

          const {data} = res.data;
          const dataContent = data.content.map(item => {
            // / console.log(formatTime(new Date('2020-11-20T15:06:45.444')));
            const createdDate = formatTime(new Date(item.createdDate))
            return {
              ...item,
              createdDate
            }
          })
          that.setData({
            logs: [...that.data.logs,...dataContent],
            page: currentPage,
            total: data.totalElements,
            totalPages: data.totalPages
          })
        } else {
          wx.showToast({
            title: "获取历史记录失败，检查服务器连接状态",
            icon: "warn",
            duration: 2000,
          });
        }
        wx.hideLoading();
        that.setData({
          loading: false
        })
      },
    });
  },
  tabClick: function(e) {

    const id = e.target.dataset.id;

    if(!id) return

    const filterData = this.data.logs.find(item => item.id == id);

    const url = `data:image/png;base64,${filterData.imageBase64}`;

    if(!url) return

    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: [url] // 需要预览的图片http链接列表
      })
  }
});
