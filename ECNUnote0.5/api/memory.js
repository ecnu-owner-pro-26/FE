/**
 * 记忆模块接口
 * 对标文档：2. 记忆管理
 */
const { request } = require('../utils/request');

const memoryApi = {
  /**
   * 创建记忆
   * @param {Object} data {title, content, location_id, is_public, tags}
   */
  createMemory(data) {
    return request('/memories', 'POST', data);
  },

  /**
   * 获取地点关联的记忆列表
   * @param {number|string} locationId 
   * 对应接口: GET /locations/:id/memories
   */
  getLocationMemories(locationId) {
    return request(`/locations/${locationId}/memories`, 'GET');
  },

  /**
   * 互动：点赞记忆
   * 对应接口: POST /memories/:id/like
   */
  likeMemory(id) {
    return request(`/memories/${id}/like`, 'POST');
  },

  /**
   * 互动：取消点赞
   * 对应接口: DELETE /memories/:id/like
   */
  unlikeMemory(id) {
    return request(`/memories/${id}/like`, 'DELETE');
  }
};

module.exports = memoryApi;