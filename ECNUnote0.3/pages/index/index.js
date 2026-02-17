Page({
  data: {
    lat: 31.2272, lng: 121.4011, sc: 14,
    s: 0, c: '', cn: '', t: '', subList: []
  },

  onRegionChange(e) {}, // 保持空，确保滑动不卡

  next(e) { this.setData({ s: parseInt(e.currentTarget.dataset.v) }); },

  setSub(e) {
    let v = e.currentTarget.dataset.c;
    let n = { p: '普陀', m: '闵行', d: '滴水湖' }[v];
    this.setData({ c: v, cn: n, s: 2 });
  },

  setT(e) {
    let t = e.currentTarget.dataset.t;
    // 固化子地点坐标，防止地址错误
    let list = [];
    if (this.data.c === 'p') { // 普陀子地点
      if (t === 'C') list = [{n:'河西食堂', la:31.2235, ln:121.3985}, {n:'河东食堂', la:31.2257, ln:121.4052}];
      else if (t === 'D') list = [{n:'1号楼', la:31.2285, ln:121.4022}, {n:'15号楼', la:31.2215, ln:121.4035}];
      else list = [{n:'一教', la:31.2265, ln:121.4042}, {n:'三教', la:31.2288, ln:121.4031}];
    } else { // 闵行子地点
      if (t === 'C') list = [{n:'秋实阁', la:31.0210, ln:121.4520}, {n:'冬月阁', la:31.0298, ln:121.4375}];
      else if (t === 'D') list = [{n:'研究生公寓', la:31.0205, ln:121.4335}, {n:'本科生宿舍', la:31.0255, ln:121.4565}];
      else list = [{n:'实验楼', la:31.0275, ln:121.4421}, {n:'办公楼', la:31.0315, ln:121.4445}];
    }
    this.setData({ t: t, subList: list, s: 3 });
  },

  goB() {
    const pos = {
      p: { la: 31.22558, ln: 121.40118 },
      m: { la: 31.02633, ln: 121.44555 },
      d: { la: 30.89220, ln: 121.91330 }
    };
    const target = pos[this.data.c];
    if (target) this.doMove(target.la, target.ln, '图书馆');
  },

  goFinal(e) {
    const item = e.currentTarget.dataset.item;
    this.doMove(item.la, item.ln, item.n);
  },

  // 核心修复：极致响应的传送
  doMove(la, ln, title) {
    // 强制更新坐标和缩放，并关闭菜单
    // 注意：这里不再使用 moveToLocation，因为 data 驱动在真机上更同步
    this.setData({
      lat: la,
      lng: ln,
      sc: 17,
      s: 0 
    });
    wx.showToast({ title: '已至' + title, icon: 'none', duration: 1000 });
  },

  toP() {
    wx.vibrateShort({ type: 'light' });
    const mapCtx = wx.createMapContext('mMap');
    mapCtx.getCenterLocation({
      success: (res) => {
        wx.navigateTo({ 
          url: `/pages/post/post?lng=${res.longitude}&lat=${res.latitude}` 
        });
      }
    });
  }
});