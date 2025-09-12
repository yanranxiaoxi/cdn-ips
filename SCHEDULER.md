# 定时任务调度器功能

## 概述

本项目新增了简单的定时任务调度器功能，可以在 Docker 启动时和每 10 分钟自动调用缓存预更新接口，确保 CDN IP 数据始终保持最新状态。

## 功能特性

### 1. 自动缓存预更新

- **启动时执行**: Docker 容器启动时立即执行一次缓存预更新
- **定时执行**: 每 10 分钟自动执行一次缓存预更新
- **错误处理**: 记录错误次数，但不自动禁用任务
- **简单可靠**: 专注于核心功能，无复杂的管理逻辑

### 2. 状态监控

- **状态查看**: 提供简单的状态查看接口
- **执行记录**: 记录上次执行时间和错误次数

## API 接口

### 调度器状态

```
GET /scheduler/status
```

返回定时任务的状态信息，包括：

- 任务 ID 和名称
- 是否启用
- 执行间隔（毫秒和分钟）
- 上次执行时间
- 下次执行时间
- 错误计数

### 手动触发缓存预更新

```
GET /cache/preupdate
```

使用现有的缓存预更新接口手动触发更新。

## 配置说明

### 默认配置

定时任务功能使用以下固定配置：

- **执行间隔**: 10 分钟 (600,000 毫秒)
- **启动时执行**: 是
- **任务类型**: 缓存预更新

### 修改配置

如需修改执行间隔，可以在 `src/utils/scheduler.ts` 中调整：

```typescript
private taskStatus: TaskStatus = {
    id: 'cache-preupdate',
    name: 'Cache Preupdate Task',
    interval: 10 * 60 * 1000, // 修改这里的间隔时间
    enabled: true,
    errorCount: 0,
};
```

## 日志监控

定时任务的执行情况会记录在日志中，包括：

- 任务开始执行
- 执行成功/失败
- 执行耗时
- 错误信息

### 日志示例

```
[INFO] Starting simple task scheduler...
[INFO] Executing cache preupdate immediately on startup
[INFO] Scheduled cache preupdate completed - duration: 2341ms
[INFO] Task scheduler started - next run: 2024-01-01T10:10:00.000Z
```

## 测试

### 手动测试

1. 启动服务器
2. 访问 `http://localhost:3001/scheduler/status` 查看任务状态
3. 访问 `http://localhost:3001/cache/preupdate` 手动触发更新
4. 观察日志输出确认任务正常执行

## Docker 部署

定时任务功能在 Docker 容器中自动启动，无需额外配置：

```bash
# 构建镜像
docker build -t cdn-ips .

# 运行容器
docker run -p 3001:3001 cdn-ips
```

容器启动后会自动：

1. 立即执行一次缓存预更新
2. 启动定时任务，每 10 分钟执行一次
3. 记录所有执行日志

## 故障排除

### 任务未执行

1. 检查调度器状态：`GET /scheduler/status`
2. 查看日志中的错误信息
3. 确认服务器正常启动

### 任务执行失败

1. 检查网络连接
2. 确认 CDN 提供商 API 可访问
3. 查看详细错误日志
4. 考虑手动触发测试：`GET /cache/preupdate`

### 性能问题

1. 调整执行间隔（如果 10 分钟太频繁）
2. 检查服务器资源使用情况
3. 监控日志中的执行耗时

## 技术实现

### 核心组件

- **SimpleScheduler**: 简化的定时任务调度器
- **CacheController**: 缓存控制器（复用现有的 preupdate 逻辑）
- **SchedulerController**: 调度器状态接口

### 架构特点

- 非阻塞异步执行
- 代码复用：定时任务直接调用现有的缓存预更新逻辑
- 简单的错误记录
- 内存高效的任务管理
- 基础的监控和日志记录

### 代码复用

定时任务通过调用 `cacheController.preupdateCache()` 方法来实现缓存预更新，该方法是从现有的 `preupdate` HTTP 接口中提取的核心逻辑，确保了：

- 相同的业务逻辑
- 统一的错误处理
- 一致的日志记录
- 便于维护和更新
