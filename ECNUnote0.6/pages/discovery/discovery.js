Page({
  data: {
    allList: [],
    ls: [],
    c: 'all',
    rankType: 'day',
    topicTag: '',
    keyword: '',
    pageSize: 10,
    visibleCount: 10,
    loading: false,
    hasMore: true,
    locationId: null
  },

  onLoad(options) {
    const locationId = options.locationId ? parseInt(options.locationId, 10) : null;
    const c = (locationId >= 201 ? 'm' : locationId >= 101 ? 'p' : 'all');
    const topicTag = options.topicTag || wx.getStorageSync('discoveryTopicTag') || '';
    if (topicTag) wx.removeStorageSync('discoveryTopicTag');
    this.setData({ locationId, c, topicTag }, () => this.init());
  },

  onShow() {
    const bar = this.getTabBar && this.getTabBar();
    if (bar) bar.setData({ selected: 1 });
    this.syncTopicTagFromStorage();
  },

  syncTopicTagFromStorage() {
    const topicTag = wx.getStorageSync('discoveryTopicTag');
    if (!topicTag || topicTag === this.data.topicTag) return;
    wx.removeStorageSync('discoveryTopicTag');
    this.setData({ topicTag }, () => this.applyFilters(true));
  },

  /** 下拉刷新：清空列表、重置分页后重新拉取第一页 */
  onPullDownRefresh() {
    this.setData({
      ls: [],
      allList: [],
      visibleCount: this.data.pageSize,
      hasMore: true,
      loading: false
    }, () => this.init());
  },

  /** 顶栏筛选：data-v 为 all(全部)/hot(热门)/p(普陀)/m(闵行)/d(滴水湖) */
  sel(e) {
    const t = e.currentTarget.dataset.v;
    if (this.data.c === t) return;

    this.setData({
      c: t,
      ls: [],
      visibleCount: this.data.pageSize,
      hasMore: true
    }, () => this.applyFilters(true));
  },

  /** 热门榜单切换：day / week / month */
  switchRank(e) {
    const rankType = e.currentTarget.dataset.v;
    if (this.data.rankType === rankType) return;
    this.setData({ rankType, visibleCount: this.data.pageSize }, () => this.applyFilters(true));
  },

  onSearchInput(e) {
    this.setData({ keyword: (e.detail.value || '').trim() }, () => this.applyFilters(true));
  },

  clearSearch() {
    if (!this.data.keyword) return;
    this.setData({ keyword: '' }, () => this.applyFilters(true));
  },

  clearTopicTag() {
    if (!this.data.topicTag) return;
    this.setData({ topicTag: '' }, () => this.applyFilters(true));
  },

  /**
   * 加载列表（当前前端模拟）
   * 后端联调建议：
   * - 普通广场：GET /api/memories?campus=all|p|m|d&keyword=&page=1&page_size=10
   * - 热榜：GET /api/memories/rank?period=day|week|month&keyword=&page=1&page_size=10
   */
  init() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    const mock = [
      { id: 1, title: "丽娃河的猫", content: "为了过冬囤了不少肉。", location_name: "河西食堂", location_id: 101, view_count: 88, comment_count: 5, create_time: "刚刚", campus: "p", is_liked: false, like_count: 10, topic_tags: ['生活', '治愈'] },
      { id: 2, title: "理科楼自习", content: "期末复习中。", location_name: "理科大楼", location_id: 102, view_count: 120, comment_count: 8, create_time: "5分钟前", campus: "p", is_liked: true, like_count: 25, topic_tags: ['学习'] },
      { id: 3, title: "樱桃河午后", content: "这里的樱花已经有花苞了。", location_name: "秋实阁", location_id: 201, view_count: 230, comment_count: 12, create_time: "1小时前", campus: "m", is_liked: false, like_count: 5, topic_tags: ['摄影', '生活'] },
      { id: 4, title: "实验楼夜色", content: "国软院的红墙配晚霞绝了。", location_name: "实验楼", location_id: 202, view_count: 90, comment_count: 3, create_time: "2小时前", campus: "m", is_liked: false, like_count: 5, topic_tags: ['摄影'] },
      { id: 5, title: "图书馆闭馆前", content: "最后十分钟冲刺背书，大家都在奋战。", location_name: "图书馆", location_id: 103, view_count: 300, comment_count: 17, create_time: "3小时前", campus: "p", is_liked: false, like_count: 66, topic_tags: ['学习', '吐槽'] },
      { id: 6, title: "操场晚风", content: "跑完步坐在看台发呆，心情一下子安静了。", location_name: "操场", location_id: 203, view_count: 260, comment_count: 11, create_time: "4小时前", campus: "m", is_liked: false, like_count: 34, topic_tags: ['治愈', '生活'] },
      { id: 7, title: "滴水湖日出", content: "第一次在校区看到这么漂亮的日出。", location_name: "滴水湖畔", location_id: 301, view_count: 415, comment_count: 31, create_time: "今天", campus: "d", is_liked: true, like_count: 92, topic_tags: ['摄影', '治愈'] },
      { id: 8, title: "期中周碎碎念", content: "希望大家都能稳住心态，别太焦虑。", location_name: "教学楼A", location_id: 104, view_count: 178, comment_count: 26, create_time: "今天", campus: "p", is_liked: false, like_count: 47, topic_tags: ['求助', '学习'] },
      { id: 9, title: "食堂新品测评", content: "红烧牛肉面合格，糖醋排骨有惊喜。", location_name: "二食堂", location_id: 204, view_count: 340, comment_count: 40, create_time: "昨天", campus: "m", is_liked: false, like_count: 73, topic_tags: ['美食'] },
      { id: 10, title: "夜跑搭子招募", content: "每晚九点操场三圈，有想一起的吗？", location_name: "操场", location_id: 203, view_count: 201, comment_count: 18, create_time: "昨天", campus: "m", is_liked: false, like_count: 38, topic_tags: ['生活', '情感'] },
      { id: 11, title: "华政路口的风", content: "和朋友散步聊天，突然觉得校园好温柔。", location_name: "校门口", location_id: 105, view_count: 145, comment_count: 9, create_time: "昨天", campus: "p", is_liked: false, like_count: 28, topic_tags: ['情感'] },
      { id: 12, title: "周末自习打卡", content: "今天效率不错，准备奖励自己一杯奶茶。", location_name: "图书馆", location_id: 103, view_count: 167, comment_count: 14, create_time: "2天前", campus: "p", is_liked: false, like_count: 36, topic_tags: ['学习', '美食'] }
    ];

    setTimeout(() => {
      this.setData({
        allList: mock,
        loading: false
      }, () => this.applyFilters(true));
      wx.stopPullDownRefresh();
    }, 350);
  },

  hotScore(item) {
    const like = item.like_count || 0;
    const comment = item.comment_count || 0;
    const view = item.view_count || 0;
    const rankType = this.data.rankType;

    if (rankType === 'day') return like * 3 + comment * 2 + view * 0.8;
    if (rankType === 'week') return like * 2 + comment * 2.4 + view * 0.5;
    return like * 1.6 + comment * 2 + view * 0.3;
  },

  applyFilters(resetVisible) {
    let list = [...this.data.allList];
    const { c, locationId, keyword, topicTag } = this.data;

    if (c !== 'all' && c !== 'hot') {
      list = list.filter(i => i.campus === c);
    }

    if (locationId) {
      list = list.filter(i => i.location_id === locationId);
    }

    if (keyword) {
      list = list.filter(i =>
        (i.title || '').includes(keyword) ||
        (i.content || '').includes(keyword) ||
        (i.location_name || '').includes(keyword)
      );
    }

    if (topicTag) {
      list = list.filter(i => (i.topic_tags || []).includes(topicTag));
    }

    if (c === 'hot') {
      list.sort((a, b) => this.hotScore(b) - this.hotScore(a));
      list = list.map((item, index) => ({ ...item, rank: index + 1 }));
    }

    if (resetVisible) {
      this.setData({ visibleCount: this.data.pageSize });
    }

    const visibleCount = resetVisible ? this.data.pageSize : this.data.visibleCount;
    const ls = list.slice(0, visibleCount);
    this.filteredList = list;

    this.setData({
      ls,
      hasMore: list.length > visibleCount
    });
  },

  /** 查看更多：每次多显示 10 条 */
  more() {
    if (!this.filteredList || this.filteredList.length <= this.data.visibleCount) {
      this.setData({ hasMore: false });
      return;
    }

    const nextVisible = this.data.visibleCount + this.data.pageSize;
    const ls = this.filteredList.slice(0, nextVisible);
    this.setData({
      visibleCount: nextVisible,
      ls,
      hasMore: this.filteredList.length > nextVisible
    });
  },

  /** 卡片点赞状态变化：根据 targetId 更新 ls 和 allList 中对应项 */
  onCardLike(e) {
    const { status, targetId } = e.detail;
    const syncList = (listKey) => {
      const list = this.data[listKey];
      const index = list.findIndex(item => item.id === targetId);
      if (index === -1) return;
      const oldCount = list[index].like_count || 0;
      this.setData({
        [`${listKey}[${index}].is_liked`]: status,
        [`${listKey}[${index}].like_count`]: status ? oldCount + 1 : Math.max(0, oldCount - 1)
      });
    };
    syncList('ls');
    syncList('allList');
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