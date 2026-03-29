/**
 * 小程序入口 app.js
 * 全局数据：userInfo、currentCampusId；启动时可做 token 校验与拉取用户信息
 */
App({
  onLaunch() {
    console.log('ECNU Note Project Launched');
    const token = wx.getStorageSync('token');
    if (token) {
      // 可在此调用 api/auth.js 获取最新 profile
    }
  },
  globalData: {
    userInfo: null,
    // 使用 campus_id 替代拼音，确保与后端数据库索引对齐
    currentCampusId: 1 
  }
});