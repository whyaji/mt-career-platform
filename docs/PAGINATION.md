# Pagination System

This document explains how to use the global pagination system implemented in the application.

## Configuration

The pagination settings are configured in `config/pagination.php`:

-   **Default page**: 1
-   **Default limit**: 15 items per page
-   **Default order**: asc (ascending)
-   **Default sort_by**: id
-   **Min limit**: 1
-   **Max limit**: 100
-   **Search min length**: 2 characters
-   **Search max length**: 100 characters

## Usage in Controllers

### 1. Use the PaginationTrait

```php
use App\Traits\PaginationTrait;

class YourController extends Controller
{
    use PaginationTrait;

    // Your methods here
}
```

### 2. Implement Pagination in Methods

```php
public function getItems(Request $request)
{
    try {
        // Get pagination parameters
        $paginationParams = $this->getPaginationParams($request);

        // Define searchable fields
        $searchableFields = ['name', 'email', 'description'];

        // Build query
        $query = YourModel::select('id', 'name', 'email', 'description');

        // Apply pagination with search
        $result = $this->paginateQuery($query, $paginationParams, $searchableFields);

        return $this->paginatedResponse($result, 'Items retrieved successfully');

    } catch (\Exception $e) {
        Log::error("Error getting items: {$e->getMessage()}");
        return response()->json([
            'success' => false,
            'error' => 'INTERNAL_SERVER_ERROR'
        ], 500);
    }
}
```

## API Parameters

The following query parameters are supported:

| Parameter | Type    | Default | Description                                             |
| --------- | ------- | ------- | ------------------------------------------------------- |
| `search`  | string  | -       | Search term (searches across defined searchable fields) |
| `page`    | integer | 1       | Page number (minimum: 1)                                |
| `limit`   | integer | 15      | Items per page (range: 1-100)                           |
| `order`   | string  | asc     | Sort order (asc/desc)                                   |
| `sort_by` | string  | id      | Field to sort by                                        |
| `filter`  | string  | -       | Advanced filters (see Filter Format section)            |

## Filter Format

The `filter` parameter supports advanced filtering with the following format:

```
(column_name):(value):(condition);(column_name):(value):(condition)
```

### Supported Conditions

| Condition     | Description                | Example                           |
| ------------- | -------------------------- | --------------------------------- |
| `eq`          | Equals                     | `year:2025:eq`                    |
| `neq`         | Not equals                 | `status:0:neq`                    |
| `like`        | Like (contains)            | `location:yogyakarta:like`        |
| `not_like`    | Not like                   | `location:jakarta:not_like`       |
| `gt`          | Greater than               | `year:2020:gt`                    |
| `gte`         | Greater than or equal      | `year:2020:gte`                   |
| `lt`          | Less than                  | `year:2030:lt`                    |
| `lte`         | Less than or equal         | `year:2030:lte`                   |
| `in`          | In array (comma-separated) | `location:yogyakarta,surabaya:in` |
| `not_in`      | Not in array               | `location:jakarta,bandung:not_in` |
| `null`        | Is null                    | `deleted_at:null:null`            |
| `not_null`    | Is not null                | `created_at:null:not_null`        |
| `between`     | Between values             | `year:2020,2025:between`          |
| `not_between` | Not between values         | `year:2020,2025:not_between`      |

### Filter Examples

#### Single Filter

```
GET /api/batches?filter=year:2025:eq
```

#### Multiple Filters

```
GET /api/batches?filter=year:2025:eq;location:yogyakarta,surabaya:in
```

#### Complex Filtering

```
GET /api/batches?filter=year:2020,2025:between;status:1:eq;location:jakarta:not_like
```

#### Null Value Filtering

```
GET /api/batches?filter=deleted_at:null:null;status:1:eq
```

### Filter Configuration

Filter settings can be configured in `config/pagination.php`:

-   **Max filters**: 10 (maximum number of filters per request)
-   **Max value length**: 255 characters
-   **Supported conditions**: All conditions listed above

## Example API Calls

### Basic pagination

```
GET /api/batches?page=1&limit=10
```

### Search with pagination

```
GET /api/batches?search=2024&page=1&limit=10
```

### Sort with pagination

```
GET /api/batches?sort_by=year&order=desc&page=1&limit=10
```

### Complete example

```
GET /api/batches?search=2024&sort_by=year&order=desc&page=2&limit=20
```

### Filter with pagination

```
GET /api/batches?filter=year:2025:eq;location:yogyakarta,surabaya:in&page=1&limit=10
```

### Search with filters

```
GET /api/batches?search=2024&filter=year:2020,2025:between;status:1:eq&page=1&limit=15
```

### Complex filtering example

```
GET /api/batches?filter=year:2020,2025:between;location:jakarta:not_like;status:1:eq&sort_by=year&order=desc&page=1&limit=20
```

## Response Format

The paginated response includes:

```json
{
    "success": true,
    "message": "Batches retrieved successfully",
    "data": [
        // Array of items
    ],
    "pagination": {
        "current_page": 1,
        "per_page": 15,
        "total": 50,
        "total_pages": 4,
        "has_next_page": true,
        "has_prev_page": false,
        "next_page": 2,
        "prev_page": null
    },
    "filters": {
        "search": "2024",
        "sort_by": "year",
        "order": "desc",
        "applied_filters": [
            {
                "column": "year",
                "value": "2025",
                "condition": "eq"
            },
            {
                "column": "location",
                "value": "yogyakarta,surabaya",
                "condition": "in"
            }
        ]
    }
}
```

## Customization

### Override Default Values

You can override default values in individual controllers:

```php
protected function getPaginationParams(Request $request): array
{
    $params = parent::getPaginationParams($request);

    // Override specific defaults
    $params['limit'] = $request->get('limit', 20); // Custom default limit

    return $params;
}
```

### Custom Search Logic

For complex search requirements, you can override the search logic:

```php
protected function paginateQuery(Builder $query, array $paginationParams, array $searchableFields = []): array
{
    // Custom search logic
    if (!empty($paginationParams['search'])) {
        $search = $paginationParams['search'];
        $query->where(function ($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
              ->orWhere('description', 'LIKE', "%{$search}%")
              ->orWhereHas('category', function ($categoryQuery) use ($search) {
                  $categoryQuery->where('name', 'LIKE', "%{$search}%");
              });
        });
    }

    // Apply sorting and pagination
    $query->orderBy($paginationParams['sort_by'], $paginationParams['order']);

    // ... rest of pagination logic
}
```

### Custom Filter Logic

For complex filter requirements, you can override the filter application:

```php
protected function applyFilters(Builder $query, array $filters): void
{
    foreach ($filters as $filter) {
        $column = $filter['column'];
        $value = $filter['value'];
        $condition = $filter['condition'];

        // Custom filter logic for specific columns
        if ($column === 'institutes') {
            $this->applyInstituteFilter($query, $value, $condition);
        } else {
            // Use default filter logic
            parent::applyFilters($query, [$filter]);
        }
    }
}

private function applyInstituteFilter(Builder $query, string $value, string $condition)
{
    switch ($condition) {
        case 'in':
            $institutes = explode(',', $value);
            $query->where(function ($q) use ($institutes) {
                foreach ($institutes as $institute) {
                    $q->orWhereJsonContains('institutes', trim($institute));
                }
            });
            break;
        // Add other custom conditions
    }
}
```
