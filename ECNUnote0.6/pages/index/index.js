/**
 * 地图页 index
 * 功能：地图展示、树洞红点、快速传送、在此发布
 */
const campusApi = require('../../api/campus');
const app = getApp();

// ---------- 树洞红点数据 ----------
// 与 ECNUnote文档 一致：id 地点ID, n 名称, la 纬度, ln 经度, count 树洞条数
const MOCK_DATA = {
  'p': [ // 普陀校区
    { id: 101, n: '河西食堂-树洞', la: 31.2235, ln: 121.3985, count: 5 },
    { id: 102, n: '理科大楼-树洞', la: 31.2265, ln: 121.4042, count: 12 }
  ],
  'm': [ // 闵行校区
    { id: 201, n: '秋实阁-树洞', la: 31.0210, ln: 121.4520, count: 8 },
    { id: 202, n: '实验楼-树洞', la: 31.0275, ln: 121.4421, count: 3 }
  ]
};

// 红点点击跳转：地点ID → 帖子详情页 id
const LOCATION_TO_POST = { 101: 1, 102: 2, 201: 3, 202: 4 };

// ---------- 快速传送坐标（WGS84/GCJ-02） ----------
// 普陀 中山北路3663 | 闵行 东川路500 | 滴水湖 临港
const TELEPORT = {
  center: {
    p: { la: 31.2279, ln: 121.4047 },   // 普陀校区中心
    m: { la: 31.0263, ln: 121.4455 },   // 闵行校区中心
    d: { la: 30.8922, ln: 121.9133 }
  },
  library: {
    p: { la: 31.22558, ln: 121.40118 },
    m: { la: 31.02633, ln: 121.44555 },
    d: { la: 30.89220, ln: 121.91330 }
  },
  p: { // 普陀：食堂C / 宿舍D / 教学楼T
    C: [{ n: '河西食堂', la: 31.2235, ln: 121.3985 }, { n: '河东食堂', la: 31.2257, ln: 121.4052 }],
    D: [{ n: '1号楼', la: 31.2285, ln: 121.4022 }, { n: '15号楼', la: 31.2215, ln: 121.4035 }],
    T: [{ n: '一教', la: 31.2265, ln: 121.4042 }, { n: '三教', la: 31.2288, ln: 121.4031 }]
  },
  m: {
    C: [{ n: '秋实阁', la: 31.0210, ln: 121.4520 }, { n: '冬月阁', la: 31.0298, ln: 121.4375 }],
    D: [{ n: '研究生公寓', la: 31.0205, ln: 121.4335 }, { n: '本科生宿舍', la: 31.0255, ln: 121.4565 }],
    T: [{ n: '实验楼', la: 31.0275, ln: 121.4421 }, { n: '办公楼', la: 31.0315, ln: 121.4445 }]
  },
  d: {
    C: [{ n: '滴水湖食堂', la: 30.8925, ln: 121.9135 }],
    D: [{ n: '滴水湖宿舍', la: 30.8918, ln: 121.9128 }],
    T: [{ n: '滴水湖教学楼', la: 30.8928, ln: 121.9140 }]
  }
};

Page({
  // ---------- 页面数据 ----------
  // lat/lng 地图中心，sc 缩放，s 传送步骤(0~3)，c 当前校区(p/m/d)，cn 校区名，t 类型(C/D/T)，subList 当前类型下的地点列表
  data: {
    lat: 31.2279, lng: 121.4047, sc: 14,
    s: 0, c: 'p', cn: '普陀', t: '', subList: [],
    markers: [],
    topicTagOptions: ['学习', '情感', '生活', '美食', '吐槽', '治愈', '摄影', '求助']
  },

  onLoad() {
    this.refreshMarkers();
  },

  onShow() {
    const bar = this.getTabBar && this.getTabBar();
    if (bar) bar.setData({ selected: 0 });
  },

  // ---------- 树洞红点 ----------
  refreshMarkers() {
    const currentCampus = this.data.c || 'p';
    const rawData = MOCK_DATA[currentCampus] || [];
    
    // 转换为小程序 map 组件需要的 markers 格式
    const markers = rawData.map(item => ({
      id: item.id,
      latitude: item.la,
      longitude: item.ln,
      title: item.n,
      iconPath: '/assets/icons/marker_red.png', // 树洞红点图标
      width: 32,
      height: 32,
      label: {
        content: ` ${item.count} `,
        color: '#ffffff',
        fontSize: 12,
        bgColor: '#a41f35', // 华师大红
        borderRadius: 10,
        padding: 2,
        anchorX: -10,
        anchorY: -30
      }
    }));

    this.setData({ markers });
  },

  /** 点击地图上的红点：有对应帖子则进详情，否则进广场并带 locationId */
  onMarkerTap(e) {
    const locationId = e.markerId;
    const postId = LOCATION_TO_POST[locationId];
    if (postId) {
      wx.navigateTo({ url: `/pages/detail/detail?id=${postId}` });
    } else {
      wx.navigateTo({ url: `/pages/discovery/discovery?locationId=${locationId}` });
    }
  },

  // ---------- 快速传送（左下角菜单） ----------
  onRegionChange(e) {},

  /** 切换传送步骤：data-v 为目标步骤 0/1/2/3 */
  next(e) { this.setData({ s: parseInt(e.currentTarget.dataset.v, 10) }); },

  /** 选择校区：data-c 为 p/m/d，选后进入步骤 2 并刷新红点 */
  setSub(e) {
    const v = e.currentTarget.dataset.c;
    const cn = { p: '普陀', m: '闵行', d: '滴水湖' }[v];
    this.setData({ c: v, cn, s: 2 }, () => this.refreshMarkers());
  },

  /** 选择类型：data-t 为 C食堂/D宿舍/T教学楼，写入 subList 并进入步骤 3 */
  setT(e) {
    const t = e.currentTarget.dataset.t;
    const campus = this.data.c;
    const list = (TELEPORT[campus] && TELEPORT[campus][t]) ? TELEPORT[campus][t] : [];
    this.setData({ t, subList: list, s: 3 });
  },

  /** 一键传送到当前校区的图书馆 */
  goLibrary() {
    const campus = this.data.c;
    const target = TELEPORT.library[campus];
    if (target) this.doMove(target.la, target.ln, '图书馆');
  },

  /** 传送到当前校区中心（未在 UI 暴露，可备用） */
  goCampusCenter() {
    const campus = this.data.c;
    const target = TELEPORT.center[campus];
    if (target) this.doMove(target.la, target.ln, this.data.cn + '校区');
  },

  /** 从步骤 3 列表选具体地点：data-index 对应 subList 下标 */
  goFinal(e) {
    const idx = parseInt(e.currentTarget.dataset.index, 10);
    const list = this.data.subList || [];
    const item = list[idx];
    if (item && item.la != null && item.ln != null) this.doMove(item.la, item.ln, item.n);
  },

  /** 执行传送：移动地图中心并缩放，关闭菜单，提示“已至 xxx” */
  doMove(la, ln, title) {
    this.setData({ lat: la, lng: ln, sc: 17, s: 0 });
    wx.showToast({ title: '已至 ' + title, icon: 'none', duration: 1200 });
  },

  // ---------- 在此发布 ----------
  /** 右下角发布：直接进入发布页 */
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
  },

  /** 发布按钮上方入口：按话题看树洞 */
  openTopicFilter() {
    wx.showActionSheet({
      itemList: this.data.topicTagOptions,
      success: (res) => {
        const topicTag = this.data.topicTagOptions[res.tapIndex];
        if (!topicTag) return;
        wx.setStorageSync('discoveryTopicTag', topicTag);
        wx.switchTab({ url: '/pages/discovery/discovery' });
      }
    });
  }
});