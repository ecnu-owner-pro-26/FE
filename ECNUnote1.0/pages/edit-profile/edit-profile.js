Page({
  data: {
    tempAvatar: '',
    tempNickname: '',
    tempBio: ''
  },

  onLoad() {
    // 建议：进入编辑页时，先读取现有缓存，否则修改时会变回空白
    const info = wx.getStorageSync('userInfo');
    if (info) {
      this.setData({
        tempAvatar: info.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        tempNickname: info.nickname || 'ECNU 小狮子',
        tempBio: info.bio || '热爱丽娃河，也爱樱桃河。'
      });
    }
  },

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

  saveProfile() {
    wx.showLoading({ title: '保存中' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 1. 构造最新的用户信息对象
      const updatedUserInfo = {
        nickname: this.data.tempNickname,
        avatar: this.data.tempAvatar,
        bio: this.data.tempBio
      };

      // 2. 【关键修正】将新数据写入本地缓存
      // 这样“我的”页面在 onShow 时通过 wx.getStorageSync 就能读到新头像了
      wx.setStorageSync('userInfo', updatedUserInfo);

      // 3. 同时更新上一页（可选，但建议保留以获得即时感）
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];
      if (prevPage) {
        prevPage.setData({
          'userInfo.nickname': this.data.tempNickname,
          'userInfo.avatar': this.data.tempAvatar,
          'userInfo.bio': this.data.tempBio
        });
      }

      wx.showToast({ title: '修改成功' });
      setTimeout(() => { wx.navigateBack(); }, 1000);
    }, 500);
  }
})