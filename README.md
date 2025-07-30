[English](#) | [简体中文](./README.zh-Hans.md)

# Get CDN IPs

Obtaining the CDN provider's return IP address

## Usage

```
GET https://cdn-ips.api.soraharu.com/
```

### Input Parameter

| Parameter Name | Type                | Example              |
| -------------- | ------------------- | -------------------- |
| `providers`    | `Array<EProviders>` | `Cloudflare,EdgeOne` |
| `version`      | `EVersion`          | `v4`                 |
| `format`       | `EFormat`           | `line`               |

```typescript
export enum EProviders {
	CLOUDFLARE = 'Cloudflare',
	EDGEONE = 'EdgeOne',
	FASTLY = 'Fastly',
	GCORE = 'Gcore',
	BUNNY = 'Bunny',
	CLOUDFRONT = 'CloudFront',
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

### Error Returns

JSON format

| Parameter Name | Type      | Example   |
| -------------- | --------- | --------- |
| `success`      | `boolean` | `false`   |
| `code`         | `number`  | `3002`    |
| `message`      | `string`  | `invalid` |

## Deployment

### Container Image Information

Image: [docker.io/yanranxiaoxi/cdn-ips](https://hub.docker.com/r/yanranxiaoxi/cdn-ips)

Available labels: `latest`
