/**
 * 地图页 index
 * 功能：地图展示、树洞红点、快速传送（校区/地点从后端获取）、在此发布
 */
const campusApi = require('../../api/campus');

// 校区中心兜底坐标（地点无坐标时用）：校区 id -> { latitude, longitude }
const CAMPUS_CENTER = {
  1: { latitude: 31.2279, longitude: 121.4047 },
  2: { latitude: 31.0263, longitude: 121.4455 },
  3: { latitude: 30.8922, longitude: 121.9133 }
};

function getLocationCoords(location, campusId) {
  const lat = location.latitude ?? location.la;
  const lng = location.longitude ?? location.ln;
  if (lat != null && lng != null) return { latitude: Number(lat), longitude: Number(lng) };
  const center = CAMPUS_CENTER[campusId] || CAMPUS_CENTER[1];
  return center;
}

Page({
  data: {
    lat: 31.2279,
    lng: 121.4047,
    sc: 14,
    s: 0,
    campuses: [],
    campusId: null,
    campusName: '',
    locations: [],
    subList: [],
    t: '',
    markers: []
  },

  onLoad() {
    this.loadCampuses();
  },

  onShow() {
    const bar = this.getTabBar && this.getTabBar();
    if (bar) bar.setData({ selected: 0 });
  },

  /** 从后端获取校区列表 */
  loadCampuses() {
    campusApi.getCampuses().then((list) => {
      const campuses = Array.isArray(list) ? list : [];
      this.setData({ campuses });
    }).catch(() => {
      this.setData({ campuses: [] });
    });
  },

  /** 选择校区：请求该校区地点列表，刷新红点 */
  selectCampus(campusId, campusName) {
    this.setData({ campusId, campusName, s: 2 });
    campusApi.getCampusLocations(campusId).then((list) => {
      const locations = Array.isArray(list) ? list : [];
      const markers = this.buildMarkers(locations, campusId);
      this.setData({ locations, markers });
    }).catch(() => {
      this.setData({ locations: [], markers: [] });
    });
  },

  /** 用地点列表生成地图红点（有坐标的才显示） */
  buildMarkers(locations, campusId) {
    const iconPath = '/assets/icons/marker_red.png';
    return locations
      .filter((loc) => (loc.latitude != null || loc.la != null) && (loc.longitude != null || loc.ln != null))
      .map((loc) => {
        const la = loc.latitude ?? loc.la;
        const ln = loc.longitude ?? loc.ln;
        const count = loc.memory_count ?? 0;
        return {
          id: loc.id,
          latitude: la,
          longitude: ln,
          title: loc.name,
          iconPath,
          width: 32,
          height: 32,
          label: {
            content: ` ${count} `,
            color: '#ffffff',
            fontSize: 12,
            bgColor: '#a41f35',
            borderRadius: 10,
            padding: 2,
            anchorX: -10,
            anchorY: -30
          }
        };
      });
  },

  // ---------- 树洞红点 ----------
  onRegionChange() {},

  onMarkerTap(e) {
    const locationId = e.markerId;
    wx.navigateTo({ url: `/pages/discovery/discovery?locationId=${locationId}` });
  },

  // ---------- 快速传送 ----------
  next(e) {
    this.setData({ s: parseInt(e.currentTarget.dataset.v, 10) });
  },

  /** 步骤 1 选择校区：data-id / data-name 由 wxml 绑定 */
  setSub(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name || '';
    if (id != null) this.selectCampus(id, name);
  },

  /** 步骤 2 选择类型：按 category 筛地点，无则展示全部 */
  setT(e) {
    const t = e.currentTarget.dataset.t;
    const { locations = [], campusId } = this.data;
    const typeMap = { C: 'canteen', D: 'dorm', T: 'teaching', L: 'library' };
    const category = typeMap[t];
    const subList = category
      ? locations.filter((l) => (l.category || '').toLowerCase().indexOf((category || '').toLowerCase()) !== -1)
      : locations;
    this.setData({ t, subList, s: 3 });
  },

  /** 步骤 3 选具体地点：传送到该点坐标 */
  goFinal(e) {
    const idx = parseInt(e.currentTarget.dataset.index, 10);
    const list = this.data.subList || [];
    const item = list[idx];
    const campusId = this.data.campusId;
    if (!item) return;
    const coords = getLocationCoords(item, campusId);
    this.doMove(coords.latitude, coords.longitude, item.name || '目的地');
  },

  goLibrary() {
    const { locations = [], campusId } = this.data;
    const lib = locations.find((l) => (l.category || '').toLowerCase().indexOf('library') !== -1);
    if (lib) {
      const coords = getLocationCoords(lib, campusId);
      this.doMove(coords.latitude, coords.longitude, lib.name || '图书馆');
    } else {
      const center = CAMPUS_CENTER[campusId] || CAMPUS_CENTER[1];
      this.doMove(center.latitude, center.longitude, '图书馆');
    }
  },

  doMove(lat, lng, title) {
    this.setData({ lat, lng, sc: 17, s: 0 });
    wx.showToast({ title: '已至 ' + title, icon: 'none', duration: 1200 });
  },

  // ---------- 在此发布 ----------
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
