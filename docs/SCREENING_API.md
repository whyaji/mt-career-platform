# Screening Management API Documentation

This document describes the APIs for managing applicant screening processes.

## Authentication

All endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Manual Trigger Screening

**POST** `/api/v1/talenthub/screening/trigger`

Manually trigger screening for specific applicants by providing their IDs.

#### Request Body

```json
{
    "applicant_ids": ["uuid1", "uuid2", "uuid3"]
}
```

#### Response

```json
{
    "success": true,
    "message": "Screening triggered for 3 applicant(s)",
    "data": {
        "triggered_count": 3,
        "total_requested": 3,
        "errors": []
    }
}
```

#### Error Response

```json
{
    "success": false,
    "error": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": {
        "applicant_ids": ["The applicant ids field is required."]
    }
}
```

### 2. Rescreen All Applicants

**POST** `/api/v1/talenthub/screening/rescreen-all`

Trigger rescreening for all applicants with optional filtering.

#### Request Body (Optional)

```json
{
    "batch_id": "uuid-batch-id",
    "status_filter": [1, 2, 3, 4, 5]
}
```

#### Query Parameters

-   `batch_id` (optional): Filter by specific batch
-   `status_filter` (optional): Array of status codes to filter by
    -   `1`: pending
    -   `2`: stop
    -   `3`: not yet
    -   `4`: process
    -   `5`: done

#### Response

```json
{
    "success": true,
    "message": "Rescreening triggered for 25 applicant(s)",
    "data": {
        "triggered_count": 25,
        "total_found": 25,
        "filters": {
            "batch_id": "uuid-batch-id",
            "status_filter": [1, 2]
        },
        "errors": []
    }
}
```

### 3. Get Screening Statistics

**GET** `/api/v1/talenthub/screening/stats`

Get screening statistics with optional batch filtering.

#### Query Parameters

-   `batch_id` (optional): Filter by specific batch

#### Response

```json
{
    "success": true,
    "data": {
        "total_applicants": 100,
        "screening_status": {
            "pending": 10,
            "stopped": 5,
            "not_yet": 0,
            "processing": 2,
            "done": 83
        },
        "completion_rate": 83.0,
        "filters": {
            "batch_id": "uuid-batch-id"
        }
    }
}
```

## Status Codes

### Screening Status Values

-   `1`: Pending - Not yet processed
-   `2`: Stop - Failed screening or error
-   `3`: Not Yet - Not ready for screening
-   `4`: Process - Currently being processed
-   `5`: Done - Successfully completed screening

### HTTP Status Codes

-   `200`: Success
-   `207`: Multi-Status (partial success with some errors)
-   `400`: Bad Request (validation errors)
-   `404`: Not Found (no applicants found)
-   `500`: Internal Server Error

## Usage Examples

### Trigger screening for specific applicants

```bash
curl -X POST "https://your-api.com/api/v1/talenthub/screening/trigger" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_ids": [
      "123e4567-e89b-12d3-a456-426614174000",
      "123e4567-e89b-12d3-a456-426614174001"
    ]
  }'
```

### Rescreen all applicants in a specific batch

```bash
curl -X POST "https://your-api.com/api/v1/talenthub/screening/rescreen-all" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "batch_id": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

### Get screening statistics

```bash
curl -X GET "https://your-api.com/api/v1/talenthub/screening/stats?batch_id=123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer your-jwt-token"
```

## Notes

-   All screening operations are processed asynchronously using job queues
-   The screening process includes checks for age, physical attributes, education, program requirements, marital status, and continue education preferences
-   Failed screening jobs will automatically update the applicant's status to "stop" (2) with an error message
-   Use the statistics endpoint to monitor screening progress and completion rates

## Job Status APIs

### 4. Get Job Status

**GET** `/api/v1/talenthub/screening/job-status/{jobId}`

Get the status of a specific screening job.

#### Path Parameters

-   `jobId`: The job ID returned from trigger operations

#### Response

```json
{
    "success": true,
    "data": {
        "job_id": "screening_1234567890",
        "job_type": "screening",
        "status": "completed",
        "progress": 100,
        "message": "Screening completed successfully. Status: 5",
        "data": {
            "applicant_id": "uuid-applicant-id",
            "applicant_name": "John Doe",
            "screening_result": {
                "status": 5,
                "remark": "All screening criteria passed",
                "checks": {
                    "age": true,
                    "physical": true,
                    "program": true,
                    "education": true,
                    "marital": true,
                    "continue_education": true
                }
            }
        },
        "started_at": "2025-01-15T10:00:00Z",
        "completed_at": "2025-01-15T10:02:30Z",
        "failed_at": null,
        "duration": 150,
        "created_at": "2025-01-15T10:00:00Z",
        "updated_at": "2025-01-15T10:02:30Z"
    }
}
```

### 5. Get All Job Statuses

**GET** `/api/v1/talenthub/screening/job-statuses`

Get a list of all job statuses with filtering and pagination.

#### Query Parameters

-   `job_type` (optional): Filter by job type (`screening`, `excel_generation`)
-   `status` (optional): Filter by status (`pending`, `running`, `completed`, `failed`, `cancelled`)
-   `limit` (optional): Number of results per page (1-100, default: 20)
-   `offset` (optional): Number of results to skip (default: 0)

#### Response

```json
{
    "success": true,
    "data": {
        "job_statuses": [
            {
                "job_id": "screening_1234567890",
                "job_type": "screening",
                "status": "completed",
                "progress": 100,
                "message": "Screening completed successfully",
                "data": {...},
                "started_at": "2025-01-15T10:00:00Z",
                "completed_at": "2025-01-15T10:02:30Z",
                "failed_at": null,
                "duration": 150,
                "created_at": "2025-01-15T10:00:00Z",
                "updated_at": "2025-01-15T10:02:30Z"
            }
        ],
        "pagination": {
            "total": 50,
            "limit": 20,
            "offset": 0,
            "has_more": true
        }
    }
}
```

### 6. Get Job Statistics

**GET** `/api/v1/talenthub/screening/job-stats`

Get statistics about job performance and status distribution.

#### Query Parameters

-   `job_type` (optional): Filter by job type (`screening`, `excel_generation`)
-   `days` (optional): Number of days to look back (1-365, default: 7)

#### Response

```json
{
    "success": true,
    "data": {
        "period_days": 7,
        "job_type": "screening",
        "total_jobs": 150,
        "status_breakdown": {
            "pending": 5,
            "running": 2,
            "completed": 140,
            "failed": 3,
            "cancelled": 0
        },
        "success_rate": 97.9,
        "average_duration_seconds": 45.5
    }
}
```

## Job Status Values

### Job Status Types

-   `pending`: Job is queued but not yet started
-   `running`: Job is currently being processed
-   `completed`: Job finished successfully
-   `failed`: Job encountered an error and stopped
-   `cancelled`: Job was cancelled before completion

### Job Types

-   `screening`: Applicant screening jobs
-   `excel_generation`: Excel file generation jobs

## Additional Notes

-   Job status tracking provides real-time visibility into job progress and performance
-   Each job has a unique job ID that can be used to track its status
-   Job statuses are automatically updated throughout the job lifecycle
-   Use job statistics to monitor system performance and identify bottlenecks
