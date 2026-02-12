Page({
  data: {
    content: '',
    tempImages: [],
    lng: 0,
    lat: 0
  },

  onLoad(options) {
    // 接收从地图页传来的经纬度
    this.setData({
      lng: parseFloat(options.lng).toFixed(4),
      lat: parseFloat(options.lat).toFixed(4)
    });
  },

  goBack() { wx.navigateBack(); },

  onInput(e) {
    this.setData({ content: e.detail.value });
  },

  uploadImage() {
    wx.chooseMedia({
      count: 9 - this.data.tempImages.length,
      mediaType: ['image'],
      success: (res) => {
        const paths = res.tempFiles.map(v => v.tempFilePath);
        this.setData({ tempImages: [...this.data.tempImages, ...paths] });
      }
    });
  },

  removeImage(e) {
    const idx = e.currentTarget.dataset.index;
    const list = this.data.tempImages;
    list.splice(idx, 1);
    this.setData({ tempImages: list });
  },

  previewImage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.tempImages
    });
  },

  submit() {
    if (!this.data.content && this.data.tempImages.length === 0) {
      wx.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '发送中...' });

    // 模拟提交过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '发布成功',
        content: '你的树洞已在地图上生成',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    }, 1000);
  }
});