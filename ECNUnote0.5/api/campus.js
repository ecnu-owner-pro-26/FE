/**
 * 校区与地点模块
 * 对标文档：1. 快速导航
 */
const { request } = require('../utils/request');

const campusApi = {
  /**
   * 获取校区列表
   * 对应接口: GET /campuses
   */
  getCampuses() {
    return request('/campuses', 'GET', {}, false); // 无需认证
  },

  /**
   * 获取校区下的地点列表
   * @param {number|string} campusId 
   * 对应接口: GET /campuses/:id/locations
   */
  getCampusLocations(campusId) {
    return request(`/campuses/${campusId}/locations`, 'GET', {}, false);
  }
};

module.exports = campusApi;