/**
 * 广场页 discovery
 * 功能：树洞列表、按校区筛选、热门(按热度排序)、按地点筛选（地图红点传入）、点赞、进详情
 * 有 locationId 时调用 GET /api/locations/:id/memories
 */
const MemoryApi = require('../../api/memory');

Page({
  data: {
    ls: [],
    c: 'all',
    p: 1,
    loading: false,
    hasMore: true,
    locationId: null
  },

  onLoad(options) {
    const locationId = options.locationId ? parseInt(options.locationId, 10) : null;
    const c = (locationId >= 201 ? 'm' : locationId >= 101 ? 'p' : 'all');
    this.setData({ locationId, c }, () => this.init());
  },

  onShow() {
    const bar = this.getTabBar && this.getTabBar();
    if (bar) bar.setData({ selected: 1 });
  },

  /** 下拉刷新：清空列表、重置分页后重新拉取第一页 */
  onPullDownRefresh() {
    this.setData({ ls: [], p: 1, hasMore: true, loading: false }, () => this.init());
  },

  /** 顶栏筛选：data-v 为 all(全部)/hot(热门)/p(普陀)/m(闵行)/d(滴水湖)，重置列表并重新拉取 */
  sel(e) {
    let t = e.currentTarget.dataset.v;
    if (this.data.c === t) return;

    this.setData({
      c: t,
      ls: [],
      p: 1,
      hasMore: true
    }, () => this.init());
  },

  /**
   * 加载列表：有 locationId 用 GET /api/locations/:id/memories；无则尝试 GET /api/memories，失败用模拟数据
   */
  init() {
    if (this.data.loading || !this.data.hasMore) return;
    this.setData({ loading: true });

    const locationId = this.data.locationId;
    const done = (list, hasMore) => {
      this.setData({
        ls: this.data.p === 1 ? list : [...this.data.ls, ...list],
        loading: false,
        hasMore: hasMore !== false
      });
      wx.stopPullDownRefresh();
    };

    if (locationId) {
      MemoryApi.getLocationMemories(locationId).then((data) => {
        const list = (data || []).map((item) => ({
          id: item.id,
          title: item.title || '无标题',
          content: item.content || '',
          location_name: item.location_name || '',
          location_id: locationId,
          like_count: item.like_count || 0,
          comment_count: item.comment_count || 0,
          is_liked: !!item.is_liked,
          create_time: item.created_at || '',
          creator: item.creator
        }));
        done(list, false);
      }).catch(() => {
        this.setData({ loading: false });
        wx.stopPullDownRefresh();
      });
      return;
    }

    // 无 locationId：先请求 GET /api/memories（若后端支持），否则用模拟数据
    const params = { page: this.data.p };
    if (this.data.c === 'hot') params.sort = 'hot';
    if (this.data.c !== 'all' && this.data.c !== 'hot') params.campus = this.data.c;
    MemoryApi.getMemories(params).then((data) => {
      const raw = Array.isArray(data) ? data : (data && data.list) ? data.list : (data && data.data) ? data.data : [];
      const list = raw.map((item) => ({
        id: item.id,
        title: item.title || '无标题',
        content: item.content || '',
        location_name: item.location_name || '',
        location_id: item.location_id,
        like_count: item.like_count || 0,
        comment_count: item.comment_count || 0,
        is_liked: !!item.is_liked,
        create_time: item.created_at || '',
        creator: item.creator
      }));
      done(list, list.length >= 10);
    }).catch(() => {
      const mock = [
        { id: 1, title: "丽娃河的猫", content: "为了过冬囤了不少肉。", location_name: "河西食堂", location_id: 101, view_count: 88, comment_count: 5, create_time: "刚刚", campus: "p", is_liked: false, like_count: 10 },
        { id: 2, title: "理科楼自习", content: "期末复习中。", location_name: "理科大楼", location_id: 102, view_count: 120, comment_count: 8, create_time: "5分钟前", campus: "p", is_liked: true, like_count: 25 },
        { id: 3, title: "樱桃河午后", content: "这里的樱花已经有花苞了。", location_name: "秋实阁", location_id: 201, view_count: 230, comment_count: 12, create_time: "1小时前", campus: "m", is_liked: false, like_count: 5 },
        { id: 4, title: "实验楼夜色", content: "国软院的红墙配晚霞绝了。", location_name: "实验楼", location_id: 202, view_count: 90, comment_count: 3, create_time: "2小时前", campus: "m", is_liked: false, like_count: 5 }
      ];
      let res = this.data.c === 'hot' ? [...mock] : (this.data.c === 'all' ? mock : mock.filter(i => i.campus === this.data.c));
      if (this.data.c === 'hot') {
        const hotScore = (item) => (item.like_count || 0) * 2 + (item.comment_count || 0) + (item.view_count || 0);
        res.sort((a, b) => hotScore(b) - hotScore(a));
      }
      done(res, this.data.p < 3);
    });
  },

  /** 加载更多（上拉触底等可调此方法） */
  more() {
    this.setData({ p: this.data.p + 1 });
    this.init();
  },

  /** 卡片点赞：调用接口后更新本地 is_liked、like_count */
  onCardLike(e) {
    const { status, targetId } = e.detail;
    const list = this.data.ls;
    const index = list.findIndex(item => item.id === targetId);
    if (index === -1) return;

    const oldCount = list[index].like_count || 0;
    const fn = status ? MemoryApi.likeMemory(targetId) : MemoryApi.unlikeMemory(targetId);
    fn.then(() => {
      this.setData({
        [`ls[${index}].is_liked`]: status,
        [`ls[${index}].like_count`]: status ? oldCount + 1 : Math.max(0, oldCount - 1)
      });
    }).catch(() => {
      this.setData({ [`ls[${index}].is_liked`]: !status });
    });
  },

  /** 点击卡片：跳转详情页（详情由接口 GET /api/memories/:id 拉取） */
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
}); 