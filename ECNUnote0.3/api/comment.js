/**
 * 留言（评论）模块接口
 * 对应后端：comment_handler.go
 */
const { request } = require('../utils/request');

const commentApi = {
  /**
   * 为记忆创建留言
   * @param {string|number} memoryId - 记忆ID
   * @param {string} content - 留言内容
   * 对标接口: POST /memories/:id/comments
   */
  createComment(memoryId, content) {
    return request(`/memories/${memoryId}/comments`, 'POST', {
      content: content
    });
  },

  /**
   * 获取记忆的留言列表
   * @param {string|number} memoryId - 记忆ID
   * 对标接口: GET /memories/:id/comments
   */
  getCommentList(memoryId) {
    return request(`/memories/${memoryId}/comments`, 'GET');
  },

  /**
   * 删除留言
   * @param {string|number} commentId - 留言ID
   * 对标接口: DELETE /comments/:id
   */
  deleteComment(commentId) {
    return request(`/comments/${commentId}`, 'DELETE');
  }
};

module.exports = commentApi;
