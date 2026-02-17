Page({
  data: {
    tempAvatar: '',
    tempNickname: '',
    tempBio: ''
  },

  onLoad() {
    // 初始数据从全局或上一个页面获取
    // 这里为了演示，先模拟当前数据
    this.setData({
      tempAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      tempNickname: 'ECNU 小狮子',
      tempBio: '热爱丽娃河，也爱樱桃河。'
    });
  },

  // 选择头像
  changeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ tempAvatar: res.tempFilePaths[0] });
      }
    });
  },

  onNicknameInput(e) { this.setData({ tempNickname: e.detail.value }); },
  onBioInput(e) { this.setData({ tempBio: e.detail.value }); },

  // 保存并返回
  saveProfile() {
    wx.showLoading({ title: '保存中' });
    
    // 模拟网络请求延迟
    setTimeout(() => {
      wx.hideLoading();
      
      // 关键：获取页面栈
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2]; // 获取“我的”页面实例

      // 直接修改上一个页面的 data
      prevPage.setData({
        'userInfo.nickname': this.data.tempNickname,
        'userInfo.avatar': this.data.tempAvatar,
        'userInfo.bio': this.data.tempBio
      });

      wx.showToast({ title: '修改成功' });
      
      // 返回上一页
      setTimeout(() => { wx.navigateBack(); }, 1000);
    }, 500);
  }
})