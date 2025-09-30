# Global Generated Files API Documentation

This document describes the global API endpoints for managing generated files across the entire system.

## Base URL

All endpoints are prefixed with: `/api/v1/generated-files`

## Authentication

All endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Get List of Generated Files

**Endpoint:** `POST /api/v1/generated-files/list`

**Description:** Retrieve a paginated list of generated files with flexible filtering options.

### Request Body

```json
{
    "filters": {
        "type": "screening-applicants-by-batch",
        "model_type": "batch",
        "model_id": "batch-uuid",
        "ext": "xlsx",
        "date_from": "2025-01-01",
        "date_to": "2025-12-31",
        "is_ready": true
    },
    "pagination": {
        "page": 1,
        "per_page": 20
    },
    "sort": {
        "field": "created_at",
        "direction": "desc"
    }
}
```

### Filter Options

-   `type` (string): Filter by file type (e.g., "screening-applicants-by-batch")
-   `model_type` (string): Filter by model type (e.g., "batch")
-   `model_id` (string): Filter by specific model ID
-   `ext` (string): Filter by file extension (e.g., "xlsx", "pdf")
-   `date_from` (date): Filter files created from this date (YYYY-MM-DD)
-   `date_to` (date): Filter files created until this date (YYYY-MM-DD)
-   `is_ready` (boolean): Filter by file readiness status

### Pagination Options

-   `page` (integer): Page number (default: 1)
-   `per_page` (integer): Items per page (default: 20, max: 100)

### Sort Options

-   `field` (string): Sort field - "created_at", "request_at", "type", "model_type", "model_id", "ext"
-   `direction` (string): Sort direction - "asc" or "desc"

### Response

```json
{
    "success": true,
    "data": [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "type": "screening-applicants-by-batch",
            "model_type": "batch",
            "model_id": "batch-uuid",
            "ext": "xlsx",
            "request_at": "2025-09-30T10:00:00.000000Z",
            "created_at": "2025-09-30T10:05:00.000000Z",
            "updated_at": "2025-09-30T10:05:00.000000Z",
            "is_ready": true,
            "download_url": "https://example.com/generated/open-program/batch-uuid/file.xlsx",
            "file_size": 245760
        }
    ],
    "pagination": {
        "current_page": 1,
        "per_page": 20,
        "total": 50,
        "last_page": 3,
        "from": 1,
        "to": 20,
        "has_more_pages": true
    },
    "message": "Generated files retrieved successfully"
}
```

---

## 2. Get Status of Multiple Files

**Endpoint:** `POST /api/v1/generated-files/status`

**Description:** Get the status of multiple generated files by their IDs.

### Request Body

```json
{
    "file_ids": [
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002"
    ]
}
```

### Response

```json
{
    "success": true,
    "data": [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "type": "screening-applicants-by-batch",
            "model_type": "batch",
            "model_id": "batch-uuid",
            "ext": "xlsx",
            "request_at": "2025-09-30T10:00:00.000000Z",
            "created_at": "2025-09-30T10:05:00.000000Z",
            "is_ready": true,
            "download_url": "https://example.com/generated/open-program/batch-uuid/file.xlsx",
            "file_size": 245760
        }
    ],
    "message": "Generated files status retrieved successfully"
}
```

---

## 3. Download Generated Files

**Endpoint:** `POST /api/v1/generated-files/download`

**Description:** Download one or multiple generated files. Single files are returned directly, multiple files are packaged in a ZIP.

### Request Body

```json
{
    "file_ids": ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001"]
}
```

### Response

-   **Single file:** Direct file download
-   **Multiple files:** ZIP file download with filename like `generated-files-2025-09-30_10-30-45.zip`

### Error Responses

```json
{
    "success": false,
    "error": "FILES_NOT_FOUND",
    "message": "No files found with the provided IDs"
}
```

```json
{
    "success": false,
    "error": "NO_READY_FILES",
    "message": "No files are ready for download"
}
```

---

## 4. Get Statistics

**Endpoint:** `POST /api/v1/generated-files/stats`

**Description:** Get comprehensive statistics about generated files with optional filtering.

### Request Body

```json
{
    "filters": {
        "type": "screening-applicants-by-batch",
        "model_type": "batch",
        "date_from": "2025-01-01",
        "date_to": "2025-12-31"
    }
}
```

### Response

```json
{
    "success": true,
    "data": {
        "total_files": 150,
        "ready_files": 145,
        "pending_files": 5,
        "total_size": 52428800,
        "total_size_formatted": "50.00 MB",
        "by_type": {
            "screening-applicants-by-batch": 100,
            "other-type": 50
        },
        "by_model_type": {
            "batch": 100,
            "other-model": 50
        },
        "by_extension": {
            "xlsx": 120,
            "pdf": 30
        },
        "created_today": 10,
        "created_this_week": 45,
        "created_this_month": 150
    },
    "message": "Generated files statistics retrieved successfully"
}
```

---

## 5. Delete Generated Files

**Endpoint:** `DELETE /api/v1/generated-files`

**Description:** Delete multiple generated files by their IDs. This will also remove the physical files from storage.

### Request Body

```json
{
    "file_ids": ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001"]
}
```

### Response

```json
{
    "success": true,
    "data": {
        "deleted_count": 2,
        "not_found_count": 0
    },
    "message": "Successfully deleted 2 files"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### Validation Error (400)

```json
{
    "success": false,
    "error": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": {
        "file_ids": ["The file_ids field is required."]
    }
}
```

### Authentication Error (401)

```json
{
    "success": false,
    "error": "UNAUTHORIZED",
    "message": "Unauthorized access"
}
```

### Internal Server Error (500)

```json
{
    "success": false,
    "error": "INTERNAL_SERVER_ERROR",
    "message": "Error processing request"
}
```

---

## Usage Examples

### Example 1: Get all Excel files from this month

```bash
curl -X POST "https://your-api.com/api/v1/generated-files/list" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "ext": "xlsx",
      "date_from": "2025-09-01",
      "date_to": "2025-09-30"
    },
    "pagination": {
      "page": 1,
      "per_page": 50
    }
  }'
```

### Example 2: Check status of specific files

```bash
curl -X POST "https://your-api.com/api/v1/generated-files/status" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "file_ids": [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001"
    ]
  }'
```

### Example 3: Download multiple files

```bash
curl -X POST "https://your-api.com/api/v1/generated-files/download" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "file_ids": [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001"
    ]
  }' \
  --output "generated-files.zip"
```

---

## Rate Limits

-   **List endpoint:** 60 requests per minute
-   **Status endpoint:** 120 requests per minute
-   **Download endpoint:** 10 requests per minute
-   **Stats endpoint:** 30 requests per minute
-   **Delete endpoint:** 20 requests per minute

## File Limits

-   **Status requests:** Maximum 50 file IDs per request
-   **Download requests:** Maximum 10 file IDs per request
-   **Delete requests:** Maximum 50 file IDs per request
-   **List pagination:** Maximum 100 items per page
