[English](#) | [简体中文](./README.zh-Hans.md)

# Get CDN IPs

Obtaining the CDN provider's back-to-origin IP addresses in the specified format

## Usage

```
GET https://cdn-ips.api.soraharu.com/
```

### Input Parameter

| Parameter Name | Type                | Example              |
| -------------- | ------------------- | -------------------- |
| `providers`    | `Array<EProviders>` | `Cloudflare,EdgeOne` |
| `version`      | `EVersion`          | `v4`                 |
| `format`       | `EFormat`           | `json-transposed`    |

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
