[English](./README.md) | [简体中文](#)

# Get CDN IPs

以适当的格式获取 CDN 提供商的回源 IP 地址列表

## 使用

```
GET https://cdn-ips.api.soraharu.com/
```

### 入参

| 参数名      | 类型                | 示例                 |
| ----------- | ------------------- | -------------------- |
| `providers` | `Array<EProviders>` | `Cloudflare,EdgeOne` |
| `version`   | `EVersion`          | `v4`                 |
| `format`    | `EFormat`           | `json-transposed`    |

```typescript
export enum EProviders {
	CLOUDFLARE = 'Cloudflare',
	EDGEONE = 'EdgeOne',
	FASTLY = 'Fastly',
	GCORE = 'Gcore',
	BUNNY = 'Bunny',
	CLOUDFRONT = 'CloudFront',
	KEYCDN = 'KeyCDN',
	QUIC_CLOUD = 'QUICcloud',
	CACHEFLY = 'CacheFly',
	AKAMAI = 'Akamai',
	GOOGLE_CLOUD = 'GoogleCloud',
	GOOGLE_CLOUD_LOAD_BALANCING = 'GoogleCloudLoadBalancing',
	CDN77 = 'CDN77',
	ARVANCLOUD = 'Arvancloud',
	F5_CDN = 'F5CDN',
	IMPERVA = 'Imperva',
	MEDIANOVA = 'Medianova',
	ALTERNCLOUD = 'ALTERNcloud',
}

export enum EVersion {
	V4 = 'v4',
	V6 = 'v6',
	ALL = 'all',
}

export enum EFormat {
	COMMA = 'comma',
	SPACE = 'space',
	LINE = 'line',
	JSON_ARRAY_WITHOUT_SQUARE_BRACKETS = 'json-array-without-square-brackets',
	JSON = 'json',
	JSON_TRANSPOSED = 'json-transposed',
	JSON_WITHOUT_PROVIDERS = 'json-without-providers',
	JSON_WITHOUT_VERSIONS = 'json-without-versions',
	JSON_ARRAY = 'json-array',
}
```

### 错误返回

JSON 格式

| 参数名    | 类型      | 示例      |
| --------- | --------- | --------- |
| `success` | `boolean` | `false`   |
| `code`    | `number`  | `3002`    |
| `message` | `string`  | `invalid` |

## 缓存管理 API

### 缓存预更新

为所有 CDN 提供商预更新缓存。

```
GET https://cdn-ips.api.soraharu.com/cache/preupdate
```

#### 示例

```bash
# 更新所有提供商缓存
curl "https://cdn-ips.api.soraharu.com/cache/preupdate"
```

#### 响应

```json
{
	"success": true,
	"message": "Successfully updated 6 cache entries",
	"results": [
		{
			"provider": "Cloudflare",
			"version": "V4",
			"success": true,
			"ipCount": 24,
			"updatedAt": "2024-01-01T12:00:00.000Z"
		}
	],
	"totalUpdated": 6,
	"totalFailed": 0,
	"updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 缓存状态

获取所有 CDN 提供商的缓存状态。

```
GET https://cdn-ips.api.soraharu.com/cache/status
```

#### 示例

```bash
# 检查所有提供商缓存状态
curl "https://cdn-ips.api.soraharu.com/cache/status"
```

#### 响应

```json
{
	"updatedAt": "2024-01-01T12:00:00.000Z",
	"providers": {
		"Cloudflare": {
			"all": {
				"exists": true,
				"optimismExists": true,
				"ipCount": 48,
				"optimismIpCount": 48
			},
			"v4": {
				"exists": true,
				"optimismExists": true,
				"ipCount": 24,
				"optimismIpCount": 24
			},
			"v6": {
				"exists": true,
				"optimismExists": true,
				"ipCount": 24,
				"optimismIpCount": 24
			}
		}
	}
}
```

## 健康检查 API

### 就绪检查

检查服务是否准备好接收请求，包括缓存状态验证。

```
GET https://cdn-ips.api.soraharu.com/health/ready
```

#### 响应

**健康 (200):**

```json
{
  "status": "healthy",
  "message": "All 19 CDN providers have valid cache",
  "details": {
    "cacheStatus": {
      "totalProviders": 19,
      "healthyProviders": 19,
      "unhealthyProviders": 0,
      "providers": [...]
    }
  },
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

**不健康 (503):**

```json
{
  "status": "unhealthy",
  "message": "3 out of 19 CDN providers have missing cache",
  "details": {
    "cacheStatus": {
      "totalProviders": 19,
      "healthyProviders": 16,
      "unhealthyProviders": 3,
      "providers": [...]
    }
  },
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 存活检查

检查服务是否存活（仅基本服务状态）。

```
GET https://cdn-ips.api.soraharu.com/health/live
```

#### 响应

```json
{
	"status": "healthy",
	"message": "Service is alive",
	"updatedAt": "2024-01-01T12:00:00.000Z"
}
```

## 部署

### 镜像信息

镜像：[docker.io/yanranxiaoxi/cdn-ips](https://hub.docker.com/r/yanranxiaoxi/cdn-ips)

可用标签：`latest`

## 感谢

本项目框架来自于 [@chidao](https://gitlab.soraharu.com/xiaoming0000/node-server-falsework)。

## 开源协议

本项目采用 [MIT License](./LICENSE) 开源。

### 许可证条款

MIT 许可证是一个宽松的开源许可证，允许您：

- ✅ 商业使用
- ✅ 修改
- ✅ 分发
- ✅ 私人使用

### 许可证要求

使用本项目时，您需要：

- 📋 包含原始许可证和版权声明
- 📋 在修改的代码中保留版权声明
