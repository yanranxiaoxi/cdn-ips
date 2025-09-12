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

## Cache Management API

### Cache Pre-update

Pre-update cache for all CDN providers.

```
GET https://cdn-ips.api.soraharu.com/cache/preupdate
```

#### Example

```bash
# Update all providers cache
curl "https://cdn-ips.api.soraharu.com/cache/preupdate"
```

#### Response

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

### Cache Status

Get cache status for all CDN providers.

```
GET https://cdn-ips.api.soraharu.com/cache/status
```

#### Example

```bash
# Check all providers cache status
curl "https://cdn-ips.api.soraharu.com/cache/status"
```

#### Response

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

## Health Check API

### Readiness Check

Check if the service is ready to receive requests, including cache status validation.

```
GET https://cdn-ips.api.soraharu.com/health/ready
```

#### Response

**Healthy (200):**

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

**Unhealthy (503):**

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

### Liveness Check

Check if the service is alive (basic service status only).

```
GET https://cdn-ips.api.soraharu.com/health/live
```

#### Response

```json
{
	"status": "healthy",
	"message": "Service is alive",
	"updatedAt": "2024-01-01T12:00:00.000Z"
}
```

## Scheduler API

### Scheduler Status

Get the status of the automatic cache pre-update scheduler.

```
GET https://cdn-ips.api.soraharu.com/scheduler/status
```

#### Response

```json
{
	"id": "cache-preupdate",
	"name": "Cache Preupdate Task",
	"interval": 600000,
	"enabled": true,
	"lastRun": "2024-01-01T12:00:00.000Z",
	"nextRun": "2024-01-01T12:10:00.000Z",
	"errorCount": 0
}
```

## Automatic Cache Management

The service includes an automatic scheduler that:

- **Executes on startup**: Immediately runs cache pre-update when the service starts
- **Runs every 10 minutes**: Automatically updates cache for all CDN providers
- **Error handling**: Records error counts but continues running
- **Interface control**: Can be disabled via environment variable

### Environment Variables

#### Cache Pre-update Interface Control

Control whether the manual cache pre-update endpoint is available:

```bash
# Enable cache pre-update endpoint (default)
ENABLE_CACHE_PREUPDATE=true

# Disable cache pre-update endpoint
ENABLE_CACHE_PREUPDATE=false
```

**Supported values:**

- `true`, `1`, `yes` - Enable endpoint
- `false`, `0`, `no` - Disable endpoint

**Notes:**

- When disabled, manual calls to `/cache/preupdate` will return 404
- The automatic scheduler continues to run regardless of this setting
- Other endpoints (like `/cache/status`, `/scheduler/status`) are not affected

## Deployment

### Container Image Information

Image: [docker.io/yanranxiaoxi/cdn-ips](https://hub.docker.com/r/yanranxiaoxi/cdn-ips)

Available labels: `latest`

## Acknowledgments

This project framework is from [@chidao](https://gitlab.soraharu.com/xiaoming0000/node-server-falsework).

## Open Source License

This project is open source under [MIT License](./LICENSE).

### License Terms

The MIT License is a permissive open source license that allows you to:

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

### License Requirements

When using this project, you need to:

- 📋 Include the original license and copyright notice
- 📋 Retain copyright notice in modified code
