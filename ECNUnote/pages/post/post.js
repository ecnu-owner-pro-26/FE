/**
 * 发布页 post
 * 功能：输入内容、选图、使用地图中心坐标发布树洞，对接 POST /api/memories
 */
const MemoryApi = require('../../api/memory');

Page({
  data: {
    content: '',
    tempImages: [],
    lng: '正在定位...',
    lat: '',
    locationId: 1  // 默认地点ID，可从地图页传入 locationId
  },

  onLoad(options) {
    if (options.locationId) {
      this.setData({ locationId: parseInt(options.locationId, 10) });
    }
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

  /** 提交发布：调用 POST /api/memories，需要登录（JWT） */
  submit() {
    const content = (this.data.content || '').trim();
    if (!content && this.data.tempImages.length === 0) {
      wx.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }

    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showModal({
        title: '需要登录',
        content: '发布记忆需要先登录',
        confirmText: '去登录',
        success: (res) => { if (res.confirm) wx.navigateTo({ url: '/pages/login/login' }); }
      });
      return;
    }

    const title = content.length > 50 ? content.slice(0, 50) : content;
    const locationId = this.data.locationId || 1;

    MemoryApi.createMemory({
      title,
      content,
      location_id: locationId,
      is_public: true,
      tags: []
    }).then(() => {
      wx.showModal({
        title: '发布成功',
        content: '你的树洞已在地图上生成',
        showCancel: false,
        success: () => { wx.navigateBack(); }
      });
    }).catch(() => {});
  }
});