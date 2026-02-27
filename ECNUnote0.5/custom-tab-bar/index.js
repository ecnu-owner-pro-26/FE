/**
 * 自定义 tabBar：支持调大底栏字号与样式
 */
Component({
  data: {
    list: [
      { pagePath: '/pages/index/index', text: '地图' },
      { pagePath: '/pages/discovery/discovery', text: '广场' },
      { pagePath: '/pages/me/me', text: '我的' }
    ],
    selected: 0
  },
  methods: {
    switchTab(e) {
      const idx = e.currentTarget.dataset.idx;
      const path = this.data.list[idx].pagePath;
      this.setData({ selected: idx });
      wx.switchTab({ url: path });
    }
  },
  attached() {
    const pages = getCurrentPages();
    const cur = pages[pages.length - 1];
    const route = cur ? (cur.route || '') : '';
    const idx = this.data.list.findIndex(i => path2route(i.pagePath) === route);
    if (idx !== -1) this.setData({ selected: idx });
  }
});

function path2route(p) {
  return p.startsWith('/') ? p.slice(1) : p;
}
