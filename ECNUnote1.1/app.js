/**
 * 小程序入口 app.js
 * 全局数据：userInfo、currentCampusId；启动时拉取用户信息（需 token）
 */
const authApi = require('./api/auth');

App({
  onLaunch() {
    console.log('ECNU Note Project Launched');
    const token = wx.getStorageSync('token');
    if (token) {
      authApi.getProfile().then((data) => {
        this.globalData.userInfo = data;
      }).catch(() => {});
    } else {
      wx.reLaunch({ url: '/pages/login/login' });
    }
  },
  globalData: {
    userInfo: null,
    // 使用 campus_id 替代拼音，确保与后端数据库索引对齐
    currentCampusId: 1 
  }
});