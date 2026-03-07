# 前端当前请求的 API 路径清单（供后端改路由后对照）

**基础地址**：`http://106.14.10.73:8080/api`（见 `utils/request.js` 的 BASE_URL）

以下路径都是拼在 base 后面的相对路径，实际请求 = BASE_URL + 路径。

---

## 认证 auth（api/auth.js）

| 用途         | 方法   | 路径             | 说明 |
|--------------|--------|------------------|------|
| 微信登录     | POST   | `/auth/login`    | 主用；404 时会依次尝试 `/auth/wechat/login`、`/wechat/login` |
| 获取个人信息 | GET    | `/auth/profile`  | 需 JWT |

---

## 校区与地点（api/campus.js）

| 用途           | 方法 | 路径                          |
|----------------|------|-------------------------------|
| 校区列表       | GET  | `/campuses`                   |
| 校区下地点列表 | GET  | `/campuses/:id/locations`     |

---

## 记忆（api/memory.js）

| 用途           | 方法   | 路径                          |
|----------------|--------|-------------------------------|
| 创建记忆       | POST   | `/memories`                   |
| 记忆详情       | GET    | `/memories/:id`               |
| 记忆列表       | GET    | `/memories` 或 `/memories?query` |
| 地点下的记忆   | GET    | `/locations/:id/memories`     |
| 点赞记忆       | POST   | `/memories/:id/like`          |
| 取消点赞       | DELETE | `/memories/:id/like`          |

---

## 评论（api/comment.js）

| 用途         | 方法   | 路径                          |
|--------------|--------|-------------------------------|
| 创建评论     | POST   | `/memories/:id/comments`      |
| 评论列表     | GET    | `/memories/:id/comments`      |
| 删除评论     | DELETE | `/comments/:id`               |

---

## 上传（utils/request.js）

| 用途   | 方法       | 路径     |
|--------|------------|----------|
| 上传文件 | uploadFile | `/upload` |

---

## 错误码 15002 说明（前端已处理）

若后端返回 `body.code === 15002`，前端会 Toast：「接口已变更(15002)，请与后端确认新路由」。  
请后端提供新路径对照表后，按上表在对应 api 文件中把路径改成新路由即可。
