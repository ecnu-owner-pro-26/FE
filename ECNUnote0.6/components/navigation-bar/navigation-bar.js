Component({
  properties: {
    title: { type: String, value: '花狮地图树洞' },
    showBack: { type: Boolean, value: false },
    bgColor: { type: String, value: '#a41f35' }, // 默认华师大红
    textColor: { type: String, value: '#ffffff' }
  },
  data: {
    statusBarHeight: 20 // 默认值，会在 attached 中更新
  },
  lifetimes: {
    attached() {
      // 获取系统状态栏高度，确保导航栏不在刘海下面
      const sysInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sysInfo.statusBarHeight
      });
    }
  },
  methods: {
    onBack() {
      wx.navigateBack({ delta: 1 });
    }
  }
})