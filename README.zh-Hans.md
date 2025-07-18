[English](./README.md) | [简体中文](#)

# Get CDN IPs

获取 CDN 提供商的回源 IP 地址

## 使用

```
GET https://cdn-ips.api.soraharu.com/
```

### 入参

| 参数名      | 类型                | 示例                 |
| ----------- | ------------------- | -------------------- |
| `providers` | `Array<EProviders>` | `Cloudflare,EdgeOne` |
| `version`   | `EVersion`          | `v4`                 |
| `format`    | `EFormat`           | `line`               |

```typescript
export enum EProviders {
	CLOUDFLARE = 'Cloudflare',
	EDGEONE = 'EdgeOne',
	FASTLY = 'Fastly',
	ALL = 'all',
}

export enum EVersion {
	V4 = 'v4',
	V6 = 'v6',
	ALL = 'all',
}

export enum EFormat {
	JSON_ARRAY = 'json-array',
	JSON_ARRAY_LIKE = 'json-array-like',
	COMMA = 'comma',
	SPACE = 'space',
	LINE = 'line',
}
```

### 错误返回

JSON 格式

| 参数名    | 类型      | 示例      |
| --------- | --------- | --------- |
| `success` | `boolean` | `false`   |
| `code`    | `number`  | `3002`    |
| `message` | `string`  | `invalid` |

## 部署

### 镜像信息

镜像：[docker.io/yanranxiaoxi/cdn-ips](https://hub.docker.com/r/yanranxiaoxi/cdn-ips)

可用标签：`stable`
