Page({
  data: {
    content: '',
    tempImages: [],
    lng: '正在定位...',
    lat: ''
  },

  onLoad(options) {
    // 检查是否有从地图页传来的参数 [cite: 4]
    if (options.lng && options.lat && options.lng !== 'undefined') {
      this.setData({
        lng: parseFloat(options.lng).toFixed(4),
        lat: parseFloat(options.lat).toFixed(4)
      });
    } else {
      // 备选方案：如果参数丢失，尝试重新获取实时定位
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.setData({
            lng: res.longitude.toFixed(4),
            lat: res.latitude.toFixed(4)
          });
        },
        fail: () => {
          this.setData({ lng: '定位失败', lat: '' });
        }
      });
    }
  },

  goBack() { wx.navigateBack(); },

  onInput(e) {
    this.setData({ content: e.detail.value });
  },

  uploadImage() {
    wx.chooseMedia({
      count: 9 - this.data.tempImages.length,
      mediaType: ['image'],
      sizeType: ['compressed'], // 优化：压缩图片，提升上传速度
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

    // 模拟提交过程 [cite: 12]
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