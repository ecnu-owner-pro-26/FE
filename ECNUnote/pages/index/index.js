/**
 * 树状传送逻辑 
 * 校区 -> 类型 -> (编号) -> 直达
 */
Page({
  data: {
    lat: 31.22967, lng: 121.400, sc: 14,
    s: 0, // 当前步数
    c: '', // 当前校区代码
    cn: '', // 校区名称
    t: '', // 当前建筑类型
    subList: [], // 编号列表
    mks: []
  },

  // 步进控制
  next(e) { this.setData({ s: parseInt(e.currentTarget.dataset.v) }); },

  // 选择校区并进入第二步
  setSub(e) {
    let v = e.currentTarget.dataset.c;
    let n = { p: '普陀', m: '闵行', d: '滴水湖' }[v];
    this.setData({ c: v, cn: n, s: 2 });
  },

  // 选择建筑类型 
  setT(e) {
    let t = e.currentTarget.dataset.t;
    let list = [];
    if (t === 'D') list = ['1号楼', '2号楼', '3号楼', '15号楼', '研究生公寓'];
    if (t === 'T') list = ['一教', '二教', '办公楼', '工程训练中心'];
    if (t === 'C') list = ['河西食堂', '河东食堂', '秋实阁'];
    
    this.setData({ t: t, subList: list, s: 3 });
  },

  // 图书馆直达逻辑 
  goB(e) {
    let c = this.data.c;
    let pos = {
      p: { la: 31.229, ln: 121.400 },
      m: { la: 31.026, ln: 121.446 },
      d: { la: 30.892, ln: 121.913 }
    };
    this.doMove(pos[c].la, pos[c].ln, '图书馆');
  },

  // 最终跳转 
  goFinal(e) {
    let n = e.currentTarget.dataset.n;
    // 这里可以根据校区+编号进行更精确的坐标计算
    this.doMove(this.data.lat + (Math.random()-0.5)*0.01, this.data.lng, n);
  },

  doMove(la, ln, title) {
    this.setData({ lat: la, lng: ln, s: 0, sc: 17 });
    wx.showToast({ title: '已传送到' + title, icon: 'none' });
  },

  toP() { wx.navigateTo({ url: '/pages/post/post' }); }
});