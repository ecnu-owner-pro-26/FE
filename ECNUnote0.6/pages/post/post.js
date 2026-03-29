/**
 * 发布页 post
 * 功能：输入内容、选图、使用地图中心坐标发布树洞（当前为模拟提交）
 */
Page({
  data: {
    title: '',
    content: '',
    tempImages: [],
    lng: '正在定位...',
    lat: '',
    selectedTags: [],
    topicTagOptions: ['学习', '情感', '生活', '美食', '吐槽', '治愈', '摄影', '求助']
  },

  onLoad(options) {
    // 优先使用地图页传来的中心点坐标，否则尝试获取当前定位
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

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  toggleTopicTag(e) {
    const idxFromView = Number(e.currentTarget.dataset.index);
    const tag = this.data.topicTagOptions[idxFromView];
    if (!tag) return;
    const selected = [...this.data.selectedTags];
    const idx = selected.indexOf(tag);

    if (idx > -1) {
      selected.splice(idx, 1);
    } else {
      if (selected.length >= 3) {
        wx.showToast({ title: '最多选择3个标签', icon: 'none' });
        return;
      }
      selected.push(tag);
    }
    this.setData({ selectedTags: selected });
  },

  /** 选择图片，最多 9 张，压缩以加快上传 */
  uploadImage() {
    wx.chooseMedia({
      count: 9 - this.data.tempImages.length,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: (res) => {
        const paths = res.tempFiles.map(v => v.tempFilePath);
        this.setData({ tempImages: [...this.data.tempImages, ...paths] });
      }
    });
  },

  /** 删除已选图片 */
  removeImage(e) {
    const idx = e.currentTarget.dataset.index;
    const list = this.data.tempImages;
    list.splice(idx, 1);
    this.setData({ tempImages: list });
  },

  /** 预览已选图片 */
  previewImage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.tempImages
    });
  },

  /** 提交发布：内容或图片至少一项；当前为模拟，成功后返回上一页 */
  submit() {
    if (!this.data.title.trim()) {
      wx.showToast({ title: '请填写标题', icon: 'none' });
      return;
    }

    if (!this.data.content.trim() && this.data.tempImages.length === 0) {
      wx.showToast({ title: '内容或图片至少一项', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '发送中...' });

    setTimeout(() => {
      const payload = {
        title: this.data.title.trim(),
        content: this.data.content.trim(),
        images: this.data.tempImages,
        topicTags: this.data.selectedTags,
        lng: this.data.lng,
        lat: this.data.lat
      };
      console.log('发布参数 payload:', payload);

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