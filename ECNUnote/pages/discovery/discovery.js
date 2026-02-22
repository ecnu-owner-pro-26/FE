/**
 * 广场页 discovery
 * 功能：树洞列表、按校区筛选、热门(按热度排序)、按地点筛选（地图红点传入）、点赞、进详情
 * 变量：ls 列表, c 筛选(all/hot/p/m/d), p 页码, locationId 从地图传入的地点ID
 *
 * 与后端对接「热门」时建议传参：
 *   - sort=hot 或 order=hot（热度排序）
 *   - 可选：campus=all|p|m|d（若热门也支持按校区筛）
 *   - 分页：page=1&page_size=10
 * 示例：GET /memories?sort=hot&page=1&page_size=10
 */
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
   * 加载列表：按 c、locationId 过滤；c=hot 时按热度排序（当前前端模拟，后端对接传 sort=hot）
   * 热度计算：like_count*2 + comment_count + view_count，数值越大越靠前
   */
  init() {
    if (this.data.loading || !this.data.hasMore) return;
    this.setData({ loading: true });

    // TODO 对接后端时：c==='hot' 可传 sort=hot 或 order=hot，其他传 campus=all|p|m|d
    const mock = [
      { id: 1, title: "丽娃河的猫", content: "为了过冬囤了不少肉。", location_name: "河西食堂", location_id: 101, view_count: 88, comment_count: 5, create_time: "刚刚", campus: "p", is_liked: false, like_count: 10 },
      { id: 2, title: "理科楼自习", content: "期末复习中。", location_name: "理科大楼", location_id: 102, view_count: 120, comment_count: 8, create_time: "5分钟前", campus: "p", is_liked: true, like_count: 25 },
      { id: 3, title: "樱桃河午后", content: "这里的樱花已经有花苞了。", location_name: "秋实阁", location_id: 201, view_count: 230, comment_count: 12, create_time: "1小时前", campus: "m", is_liked: false, like_count: 5 },
      { id: 4, title: "实验楼夜色", content: "国软院的红墙配晚霞绝了。", location_name: "实验楼", location_id: 202, view_count: 90, comment_count: 3, create_time: "2小时前", campus: "m", is_liked: false, like_count: 5 }
    ];

    setTimeout(() => {
      let res = this.data.c === 'hot'
        ? [...mock]
        : (this.data.c === 'all' ? mock : mock.filter(i => i.campus === this.data.c));

      if (this.data.locationId) {
        res = res.filter(i => i.location_id === this.data.locationId);
      }

      // 热门：按热度降序（点赞*2 + 评论 + 浏览）
      if (this.data.c === 'hot') {
        const hotScore = (item) => (item.like_count || 0) * 2 + (item.comment_count || 0) + (item.view_count || 0);
        res.sort((a, b) => hotScore(b) - hotScore(a));
      }

      this.setData({
        ls: [...this.data.ls, ...res],
        loading: false,
        hasMore: this.data.p < 3
      });
      wx.stopPullDownRefresh();
    }, 400);
  },

  /** 加载更多（上拉触底等可调此方法） */
  more() {
    this.setData({ p: this.data.p + 1 });
    this.init();
  },

  /** 卡片点赞状态变化：根据 targetId 更新 ls 中对应项的 is_liked、like_count */
  onCardLike(e) {
    const { status, targetId } = e.detail;
    const list = this.data.ls;
    const index = list.findIndex(item => item.id === targetId);

    if (index !== -1) {
      const isLikedKey = `ls[${index}].is_liked`;
      const likeCountKey = `ls[${index}].like_count`;
      const oldCount = list[index].like_count || 0;

      this.setData({
        [isLikedKey]: status,
        [likeCountKey]: status ? oldCount + 1 : Math.max(0, oldCount - 1)
      });
    }
  },

  /** 点击卡片：跳转详情页，传入 id、title、content */
  goToDetail(e) {
    let id = e.currentTarget.dataset.id;
    let it = this.data.ls.find(x => x.id == id);
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id + '&title=' + encodeURIComponent(it.title) + '&content=' + encodeURIComponent(it.content)
    });
  }
}); 