/**
 * 记忆（树洞主贴）模块接口
 * 对应后端：memory_handler.go & location_handler.go
 */
const { request } = require('../utils/request');

const memoryApi = {
  /**
   * 创建记忆
   * @param {Object} data - 包含 title, content, latitude, longitude, location_name, images 等
   * 对标接口: POST /memories
   */
  createMemory(data) {
    return request('/memories', 'POST', data);
  },

  /**
   * 获取记忆列表（广场模式）
   * @param {number} page - 页码，默认1
   * @param {number} pageSize - 每页数量，默认10
   * @param {boolean} isPublic - 是否公开（可选）
   * 对标接口: GET /memories
   */
  getMemoryList(page = 1, pageSize = 10, isPublic = null) {
    let url = `/memories?page=${page}&page_size=${pageSize}`;
    if (isPublic !== null) {
      url += `&is_public=${isPublic}`;
    }
    return request(url, 'GET');
  },

  /**
   * 获取记忆详情
   * @param {string|number} id - 记忆ID
   * 对标接口: GET /memories/:id
   */
  getMemoryDetail(id) {
    return request(`/memories/${id}`, 'GET');
  },

  /**
   * 更新记忆
   * @param {string|number} id - 记忆ID
   * @param {Object} data - 更新的内容
   * 对标接口: PUT /memories/:id
   */
  updateMemory(id, data) {
    return request(`/memories/${id}`, 'PUT', data);
  },

  /**
   * 删除记忆
   * @param {string|number} id - 记忆ID
   * 对标接口: DELETE /memories/:id
   */
  deleteMemory(id) {
    return request(`/memories/${id}`, 'DELETE');
  },

  /**
   * 根据位置获取附近的记忆（地图模式）
   * @param {number} lat - 纬度
   * @param {number} lng - 经度
   * @param {number} radius - 半径（米），默认1000
   * 对标接口: GET /locations/:lat/:lng/memories
   */
  getNearbyMemories(lat, lng, radius = 1000) {
    return request(`/locations/${lat}/${lng}/memories?radius=${radius}`, 'GET');
  }
};

module.exports = memoryApi;