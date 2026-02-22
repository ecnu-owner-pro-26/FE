campus-treehole-backend/
├── 📁 api/                    # API层 - HTTP接口
│   ├── 📁 handler/            # HTTP处理器 (7个文件)
│   │   ├── auth_handler.go    # 用户认证处理器
│   │   ├── campus_handler.go  # 校区处理器
│   │   ├── comment_handler.go # 评论处理器
│   │   ├── location_handler.go# 地点处理器
│   │   ├── memory_handler.go  # 记忆处理器
│   │   ├── quicknav_handler.go# 快速导航处理器
│   │   └── upload_handler.go  # 文件上传处理器
│   ├── 📁 router/             # 路由配置
│   │   └── router.go          # 主路由文件
│   └── 📁 token/              # JWT令牌工具
│       └── jwt.go             # JWT工具函数
│
├── 📁 application/            # 应用层 - 业务逻辑
│   ├── 📁 assembler/          # 数据组装器
│   │   └── memory_assembler.go# 记忆数据组装器
│   ├── 📁 dto/                # 数据传输对象 (5个文件)
│   │   ├── auth_dto.go        # 认证相关DTO
│   │   ├── campus_dto.go      # 校区相关DTO
│   │   ├── comment_dto.go     # 评论相关DTO
│   │   ├── memory_dto.go      # 记忆相关DTO
│   │   └── quicknav_dto.go    # 快速导航DTO
│   └── 📁 service/            # 业务服务 (7个文件)
│       ├── auth_service.go    # 认证服务
│       ├── campus_service.go  # 校区服务
│       ├── comment_service.go # 评论服务
│       ├── file_service.go    # 文件服务
│       ├── like_service.go    # 点赞服务
│       ├── memory_service.go  # 记忆服务
│       └── quicknav_service.go# 快速导航服务
│
├── 📁 infra/                  # 基础设施层 - 数据访问
│   ├── 📁 cache/              # 缓存层
│   │   └── redis.go           # Redis缓存
│   ├── 📁 model/              # 数据库模型 (8个文件)
│   │   ├── audio_model.go     # 音频模型
│   │   ├── campus_model.go    # 校区模型
│   │   ├── comment_model.go   # 评论模型
│   │   ├── image_model.go     # 图片模型
│   │   ├── like_model.go      # 点赞模型
│   │   ├── location_model.go  # 地点模型
│   │   ├── memory_model.go    # 记忆模型
│   │   └── user_model.go      # 用户模型
│   ├── 📁 repo/               # 数据访问层 (6个文件)
│   │   ├── campus_repo.go     # 校区数据访问
│   │   ├── comment_repo.go    # 评论数据访问
│   │   ├── like_repo.go       # 点赞数据访问
│   │   ├── location_repo.go   # 地点数据访问
│   │   ├── memory_repo.go     # 记忆数据访问
│   │   └── user_repo.go       # 用户数据访问
│   ├── 📁 util/               # 基础设施工具
│   │   └── response.go        # 响应工具
│   ├── database.go            # 数据库连接
│   └── init.go                # 数据库初始化
│
├── 📁 middleware/             # 中间件 (3个文件)
│   ├── auth.go                # 认证中间件
│   ├── cors.go                # 跨域中间件
│   └── logger.go              # 日志中间件
│
├── 📁 utils/                  # 工具函数 (4个文件)
│   ├── jwt.go                 # JWT工具
│   ├── password.go            # 密码工具
│   ├── response.go            # 响应工具
│   └── validator.go           # 验证工具
│
├── 📁 types/                  # 类型定义
│   ├── 📁 consts/             # 常量定义
│   ├── 📁 errno/              # 错误定义
│   ├── 📁 mapping/            # 映射定义
│   ├── comment.go             # 评论类型
│   ├── location.go            # 地点类型
│   └── memory.go              # 记忆类型
│
├── 📁 scripts/                # 脚本文件 (3个文件)
│   ├── build.sh               # 构建脚本
│   ├── init_campus_data.sql   # 校区数据初始化
│   └── init_db.sql            # 数据库初始化
│
├── 📁 docs/                   # 文档 (5个文件)
│   ├── API_COMPLETE.md        # 完整API文档
│   ├── API.md                 # 基础API文档
│   ├── docs.go                # 文档生成
│   ├── swagger.json           # Swagger JSON
│   └── swagger.yaml           # Swagger YAML
│
├── 📄 main.go                 # 应用入口
├── 📄 go.mod                  # Go模块文件
├── 📄 go.sum                  # 依赖锁定文件
├── 📄 README.md               # 项目说明
├── 📄 Makefile                # 构建脚本
├── 📄 Dockerfile              # Docker配置
├── 📄 docker-compose.yml      # Docker Compose配置
└── 📄 LICENSE                 # 许可证
一、数据库字段定义
User
type UserModel struct {
    ID          int64      // 用户唯一标识符，自动递增
    Username    string     // 用户登录名，必须唯一，如 "alice123"
    Password    string     // 加密后的密码，使用bcrypt加密，不会返回给前端
    Phone       string     // 手机号，可用于登录或找回密码，唯一
    Email       string     // 邮箱地址，可用于登录或找回密码，唯一
    Nickname    string     // 显示名称，如 "小明"，用于界面显示
    Avatar      string     // 头像图片的URL地址
    Status      int8       // 账号状态：0=禁用（不能登录），1=正常
    Role        int8       // 用户角色：0=普通用户，1=管理员（可以审核内容）
    LastLoginAt *time.Time // 最后一次登录的时间，用于统计活跃度
    CreatedAt   time.Time  // 账号创建时间
    UpdatedAt   time.Time  // 账号信息最后修改时间
    DeletedAt   *time.Time // 账号删除时间（软删除，数据不真正删除）
ip地址
}
[图片]
[图片]
memories
type MemoryModel struct {
    ID            int64      // 记忆的唯一标识符
    Title         string     // 记忆标题，如 "大学毕业典礼"
    Content       string     // 记忆的详细内容/描
    LocationName  string     // 地点名称，如 "理科大楼"
    IsPublic      bool       // 是否公开：true=所有人可见，false=只有自己可见
    ViewCount     int64      // 浏览次数统计，每次有人查看就+1（留）
    LikeCount     int64      // 点赞数统计
    CommentCount  int64      // 留言数统计
    Tags          string     // 标签，JSON格式存储，如 ["毕业","青春","回忆"]
    Status        int8       // 状态：0=待审核，1=已发布，2=已下架
    CreatorID     int64      // 创建者的用户ID，关联users表
    CreatedAt     time.Time  // 记忆创建时间
    UpdatedAt     time.Time  // 记忆最后修改时间
    DeletedAt     *time.Time // 记忆删除时间（软删除）
}
images
type ImageModel struct {
    ID           int64     // 图片唯一标识符
    MemoryID     int64     // 所属记忆的ID，关联memories表
    URL          string    // 图片完整URL，如 "http://xxx.com/storage/abc.jpg"
    Size         int64     // 文件大小（字节），如 2048576（2MB）
    SortOrder    int       // 显示顺序，数字越小越靠前
    CreatedAt    time.Time // 图片上传时间
}
//audios
type AudioModel struct {
    ID        int64     // 音频唯一标识符
    MemoryID  int64     // 所属记忆的ID，关联memories表
    URL       string    // 音频文件URL，如 "http://xxx.com/storage/voice.mp3"
    Duration  int       // 音频时长（秒），如 120（2分钟）
    Size      int64     // 文件大小（字节）
    Format    string    // 音频格式，如 "mp3", "wav", "m4a"
    CreatedAt time.Time // 音频上传时间
}
comments
type CommentModel struct {
    ID            int64      // 留言唯一标识符
    MemoryID      int64      // 留言所属的记忆ID
    UserID        int64      // 留言者的用户ID
    Content       string     // 留言内容
    ParentID      *int64     // 父留言ID，NULL=一级评论，有值=回复某条评论
    ReplyToUserID *int64     // 回复给谁的用户ID
    LikeCount     int64      // 留言的点赞数
    Status        int8       // 状态：0=待审核，1=已发布，2=已删除
    CreatedAt     time.Time  // 留言时间
    UpdatedAt     time.Time  // 留言修改时间
    DeletedAt     *time.Time // 留言删除时间（软删除）
}
likes
type LikeModel struct {
    ID         int64     // 点赞记录唯一标识符
    UserID     int64     // 点赞用户的ID
    TargetID   int64     // 被点赞对象的ID（记忆ID或留言ID）
    TargetType int8      // 点赞类型：1=记忆，2=留言
    CreatedAt  time.Time // 点赞时间
}
 Campus
字段名
业务说明
ID
校区唯一主键，自增 ID
Name
校区名称
Boundary
校区地理边界，一般存 GeoJSON 字符串，用于地图绘制范围
IsActive
是否启用，1 为启用，0 为禁用，默认启用
SortOrder
排序权重，值越大越靠前，用于列表展示排序
CreatedAt
创建时间，数据库自动生成
UpdatedAt
更新时间，数据库自动更新

Location
字段名
业务说明
ID
地点唯一主键，自增 ID
CampusID
所属校区的 ID
Name
地点名称
Category
地点分类（如“教学楼”“食堂”“宿舍”），用于归类筛选
Address

详细地址（如“西丽校区 1 号门内 50 米”）
Icon
图标路径或 URL，用于地图上显示的图标
IsActive
是否启用，1 为启用，0 为禁用，默认启用
SortOrder
排序权重，值越大越靠前
MemoryCount
关联的“记忆”数量（可能是用户打卡、评论等数据的计数）
CreatedAt
创建时间，数据库自动生成
UpdatedAt
更新时间，数据库自动更新
二、api设计
根据前端UI设计调整
用户使用流程：
用户打开应用，调用快速导航接口
选择校区（如：普陀校区）
选择具体地点（如：图书馆）
在该地点发表记忆或浏览他人记忆
可以给记忆点赞、评论、给别人的评论点赞
支持搜索地点、查看热门地点（可加）(留）
三、开发顺序
第一阶段：基础设施层
1. 数据库连接和初始化
  - infra/database.go - 实现SQLite连接
  - infra/init.go - 实现数据库自动迁移
  - main.go - 基本的启动逻辑
2. 响应工具函数（已完成）
  - pkg/utils/response.go 已经有实现
第二阶段：用户认证系统
1. JWT工具函数
  - pkg/utils/jwt.go - JWT生成和验证
  - pkg/utils/password.go - 密码加密和验证
2. 用户相关实现
  - infra/repo/user_repo.go - 用户数据访问
  - application/service/auth_service.go - 认证业务逻辑
  - api/handler/auth_handler.go - 认证接口
3. JWT中间件
  - internal/middleware/jwt.go - JWT认证中间件
第三阶段：校区地点系统
1. 校区地点数据访问
  - infra/repo/campus_repo.go - 校区数据访问
  - infra/repo/location_repo.go - 地点数据访问
2. 校区地点业务逻辑
  - application/service/campus_service.go - 校区业务逻辑
  - api/handler/campus_handler.go - 校区接口
3. 初始化测试数据
  - 执行 scripts/init_campus_data.sql 中的数据
第四阶段：记忆系统
1. 记忆数据访问
  - infra/repo/memory_repo.go - 记忆数据访问
2. 记忆业务逻辑和接口
  - application/service/memory_service.go - 记忆业务逻辑
  - api/handler/memory_handler.go - 记忆接口
  - api/handler/location_handler.go - 地点记忆列表
第五阶段：互动系统
1. 评论系统
  - infra/repo/comment_repo.go - 评论数据访问
  - application/service/comment_service.go - 评论业务逻辑
  - api/handler/comment_handler.go - 评论接口
2. 点赞系统
  - infra/repo/like_repo.go - 点赞数据访问
  - application/service/like_service.go - 点赞业务逻辑
  - 在记忆和评论handler中添加点赞接口