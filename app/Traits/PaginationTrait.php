<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;

trait PaginationTrait
{
    /**
     * Get pagination parameters from request with validation
     *
     * @param Request $request
     * @return array
     */
    protected function getPaginationParams(Request $request): array
    {
        $config = config('pagination');

        // Fallback defaults if config is not loaded
        $defaults = $config['defaults'] ?? [
            'page' => 1,
            'limit' => 15,
            'order' => 'asc',
            'sort_by' => 'id',
        ];

        $page = max(1, (int) $request->get('page', $defaults['page']));
        $limit = $this->validateLimit($request->get('limit', $defaults['limit']));
        $order = $this->validateOrder($request->get('order', $defaults['order']));
        $sortBy = $request->get('sort_by', $defaults['sort_by']);
        $search = $request->get('search', '');
        $filters = $this->parseFilters($request->get('filter', ''));

        // Handle JSON filters from request
        $jsonFilters = $this->parseJsonFilters($request);

        return [
            'page' => $page,
            'limit' => $limit,
            'order' => $order,
            'sort_by' => $sortBy,
            'search' => $search,
            'filters' => $filters,
            'json_filters' => $jsonFilters,
        ];
    }

    /**
     * Validate and sanitize limit parameter
     *
     * @param mixed $limit
     * @return int
     */
    protected function validateLimit($limit): int
    {
        $config = config('pagination');
        $limit = (int) $limit;

        // Fallback limits if config is not loaded
        $limits = $config['limits'] ?? ['min' => 1, 'max' => 100];
        $defaults = $config['defaults'] ?? ['limit' => 15];

        return max(
            $limits['min'],
            min($limit ?: $defaults['limit'], $limits['max'])
        );
    }

    /**
     * Validate order parameter
     *
     * @param mixed $order
     * @return string
     */
    protected function validateOrder($order): string
    {
        $config = config('pagination');
        $order = strtolower(trim($order));

        // Fallback orders if config is not loaded
        $orders = $config['orders'] ?? ['asc', 'desc'];
        $defaults = $config['defaults'] ?? ['order' => 'asc'];

        return in_array($order, $orders) ? $order : $defaults['order'];
    }

    /**
     * Parse filter string into array of filter conditions
     *
     * @param string $filterString
     * @return array
     */
    protected function parseFilters(string $filterString): array
    {
        if (empty($filterString)) {
            return [];
        }

        $config = config('pagination');
        $filters = [];
        $filterParts = explode(';', $filterString);

        // Fallback filter config if not loaded
        $filterConfig = $config['filters'] ?? [
            'max_filters' => 10,
            'max_value_length' => 255,
            'supported_conditions' => [
                'eq' => 'equals',
                'neq' => 'not equals',
                'like' => 'like (contains)',
                'not_like' => 'not like',
                'gt' => 'greater than',
                'gte' => 'greater than or equal',
                'lt' => 'less than',
                'lte' => 'less than or equal',
                'in' => 'in array',
                'not_in' => 'not in array',
                'null' => 'is null',
                'not_null' => 'is not null',
                'between' => 'between values',
                'not_between' => 'not between values',
            ],
        ];

        // Limit number of filters
        $filterParts = array_slice($filterParts, 0, $filterConfig['max_filters']);

        foreach ($filterParts as $filterPart) {
            $filterPart = trim($filterPart);
            if (empty($filterPart)) {
                continue;
            }

            $parts = explode(':', $filterPart, 3);
            if (count($parts) !== 3) {
                continue; // Skip invalid filter format
            }

            $column = trim($parts[0]);
            $value = trim($parts[1]);
            $condition = strtolower(trim($parts[2]));

            // Validate condition
            if (!array_key_exists($condition, $filterConfig['supported_conditions'])) {
                continue; // Skip unsupported condition
            }

            // Validate value length
            if (strlen($value) > $filterConfig['max_value_length']) {
                continue; // Skip value too long
            }

            // Check if this is a JSON column filter (column.field pattern)
            $isJsonFilter = $this->isJsonColumnFilter($column);

            $filters[] = [
                'column' => $column,
                'value' => $value,
                'condition' => $condition,
                'is_json' => $isJsonFilter,
                'json_column' => $isJsonFilter ? $this->getJsonColumnInfo($column) : null,
            ];
        }

        return $filters;
    }

    /**
     * Parse JSON filters from request (string format like regular filters)
     *
     * @param Request $request
     * @return array
     */
    protected function parseJsonFilters(Request $request): array
    {
        $jsonFilters = [];

        // Look for json_filters parameter in the request (string format)
        if ($request->has('json_filters')) {
            $filterString = $request->get('json_filters');
            if (!empty($filterString)) {
                $config = config('pagination');

                // Fallback filter config if not loaded
                $filterConfig = $config['filters'] ?? [
                    'max_filters' => 10,
                    'max_value_length' => 255,
                    'supported_conditions' => [
                        'eq' => 'equals',
                        'neq' => 'not equals',
                        'like' => 'like (contains)',
                        'not_like' => 'not like',
                        'gt' => 'greater than',
                        'gte' => 'greater than or equal',
                        'lt' => 'less than',
                        'lte' => 'less than or equal',
                        'in' => 'in array',
                        'not_in' => 'not in array',
                        'null' => 'is null',
                        'not_null' => 'is not null',
                        'between' => 'between values',
                        'not_between' => 'not between values',
                    ],
                ];

                $filterParts = explode(';', $filterString);

                // Limit number of filters
                $filterParts = array_slice($filterParts, 0, $filterConfig['max_filters']);

                foreach ($filterParts as $filterPart) {
                    $filterPart = trim($filterPart);
                    if (empty($filterPart)) {
                        continue;
                    }

                    $parts = explode(':', $filterPart, 3);
                    if (count($parts) !== 3) {
                        continue; // Skip invalid filter format
                    }

                    $column = trim($parts[0]);
                    $value = trim($parts[1]);
                    $condition = strtolower(trim($parts[2]));

                    // Validate condition
                    if (!array_key_exists($condition, $filterConfig['supported_conditions'])) {
                        continue; // Skip unsupported condition
                    }

                    // Validate value length
                    if (strlen($value) > $filterConfig['max_value_length']) {
                        continue; // Skip value too long
                    }

                    // Skip if value is empty and not null/not_null operators
                    if (empty($value) && !in_array($condition, ['null', 'not_null'])) {
                        continue;
                    }

                    // Check if this is a JSON column filter
                    $isJsonFilter = $this->isJsonColumnFilter($column);

                    $jsonFilters[] = [
                        'column' => $column,
                        'value' => $value,
                        'condition' => $condition,
                        'is_json' => $isJsonFilter,
                        'json_column' => $isJsonFilter ? $this->getJsonColumnInfo($column) : null,
                    ];
                }
            }
        }

        return $jsonFilters;
    }

    /**
     * Check if a column filter is for JSON data
     *
     * @param string $column
     * @return bool
     */
    protected function isJsonColumnFilter(string $column): bool
    {
        return strpos($column, '.') !== false;
    }

    /**
     * Get JSON column information
     *
     * @param string $column
     * @return array
     */
    protected function getJsonColumnInfo(string $column): array
    {
        $parts = explode('.', $column, 2);
        return [
            'json_column' => $parts[0],
            'field' => $parts[1] ?? null,
        ];
    }

    /**
     * Apply JSON column filter using JSON_TABLE
     *
     * @param Builder $query
     * @param array $filter
     * @return void
     */
    protected function applyJsonFilter(Builder $query, array $filter): void
    {
        $jsonColumn = $filter['json_column']['json_column'];
        $field = $filter['json_column']['field'];
        $value = $filter['value'];
        $condition = $filter['condition'];

        if (empty($field)) {
            return; // Skip if no field specified
        }

        $query->where(function ($q) use ($jsonColumn, $field, $condition, $value) {
            switch ($condition) {
                case 'eq':
                    $q->whereExists(function ($subQuery) use ($jsonColumn, $field, $value) {
                        $subQuery->selectRaw('1')
                            ->fromRaw("JSON_TABLE({$jsonColumn}, \"$[*]\" COLUMNS (
                                         question_code VARCHAR(255) PATH \"$.question_code\",
                                         answer JSON PATH \"$.answer\"
                                     )) as jt")
                            ->where('jt.question_code', $field)
                            ->where('jt.answer', $value);
                    });
                    break;

                case 'neq':
                    $q->whereNotExists(function ($subQuery) use ($jsonColumn, $field, $value) {
                        $subQuery->selectRaw('1')
                            ->fromRaw("JSON_TABLE({$jsonColumn}, \"$[*]\" COLUMNS (
                                         question_code VARCHAR(255) PATH \"$.question_code\",
                                         answer JSON PATH \"$.answer\"
                                     )) as jt")
                            ->where('jt.question_code', $field)
                            ->where('jt.answer', $value);
                    });
                    break;

                case 'like':
                    $q->whereExists(function ($subQuery) use ($jsonColumn, $field, $value) {
                        $subQuery->selectRaw('1')
                            ->fromRaw("JSON_TABLE({$jsonColumn}, \"$[*]\" COLUMNS (
                                         question_code VARCHAR(255) PATH \"$.question_code\",
                                         answer VARCHAR(1000) PATH \"$.answer\"
                                     )) as jt")
                            ->where('jt.question_code', $field)
                            ->where('jt.answer', 'LIKE', "%{$value}%");
                    });
                    break;

                case 'not_like':
                    $q->whereNotExists(function ($subQuery) use ($jsonColumn, $field, $value) {
                        $subQuery->selectRaw('1')
                            ->fromRaw("JSON_TABLE({$jsonColumn}, \"$[*]\" COLUMNS (
                                         question_code VARCHAR(255) PATH \"$.question_code\",
                                         answer VARCHAR(1000) PATH \"$.answer\"
                                     )) as jt")
                            ->where('jt.question_code', $field)
                            ->where('jt.answer', 'LIKE', "%{$value}%");
                    });
                    break;

                case 'in':
                    $values = is_array($value) ? $value : explode(',', $value);
                    $values = array_map('trim', $values);

                    $q->whereExists(function ($subQuery) use ($jsonColumn, $field, $values) {
                        $subQuery->selectRaw('1')
                            ->fromRaw("JSON_TABLE({$jsonColumn}, \"$[*]\" COLUMNS (
                                         question_code VARCHAR(255) PATH \"$.question_code\",
                                         answer JSON PATH \"$.answer\"
                                     )) as jt")
                            ->where('jt.question_code', $field)
                            ->whereIn('jt.answer', $values);
                    });
                    break;

                case 'not_in':
                    $values = is_array($value) ? $value : explode(',', $value);
                    $values = array_map('trim', $values);

                    $q->whereNotExists(function ($subQuery) use ($jsonColumn, $field, $values) {
                        $subQuery->selectRaw('1')
                            ->fromRaw("JSON_TABLE({$jsonColumn}, \"$[*]\" COLUMNS (
                                         question_code VARCHAR(255) PATH \"$.question_code\",
                                         answer JSON PATH \"$.answer\"
                                     )) as jt")
                            ->where('jt.question_code', $field)
                            ->whereIn('jt.answer', $values);
                    });
                    break;

                case 'null':
                    $q->whereExists(function ($subQuery) use ($jsonColumn, $field) {
                        $subQuery->selectRaw('1')
                            ->fromRaw("JSON_TABLE({$jsonColumn}, \"$[*]\" COLUMNS (
                                         question_code VARCHAR(255) PATH \"$.question_code\",
                                         answer JSON PATH \"$.answer\"
                                     )) as jt")
                            ->where('jt.question_code', $field)
                            ->whereNull('jt.answer');
                    });
                    break;

                case 'not_null':
                    $q->whereExists(function ($subQuery) use ($jsonColumn, $field) {
                        $subQuery->selectRaw('1')
                            ->fromRaw("JSON_TABLE({$jsonColumn}, \"$[*]\" COLUMNS (
                                         question_code VARCHAR(255) PATH \"$.question_code\",
                                         answer JSON PATH \"$.answer\"
                                     )) as jt")
                            ->where('jt.question_code', $field)
                            ->whereNotNull('jt.answer');
                    });
                    break;

                case 'gt':
                case 'gte':
                case 'lt':
                case 'lte':
                    if (!is_numeric($value)) {
                        break; // Skip this filter if value is not numeric
                    }

                    $numericValue = (float)$value;
                    $sqlOperator = match ($condition) {
                        'gt' => '>',
                        'gte' => '>=',
                        'lt' => '<',
                        'lte' => '<='
                    };

                    $q->whereExists(function ($subQuery) use ($jsonColumn, $field, $numericValue, $sqlOperator) {
                        $subQuery->selectRaw('1')
                            ->fromRaw("JSON_TABLE({$jsonColumn}, \"$[*]\" COLUMNS (
                                         question_code VARCHAR(255) PATH \"$.question_code\",
                                         answer DECIMAL(10,2) PATH \"$.answer\"
                                     )) as jt")
                            ->where('jt.question_code', $field)
                            ->whereRaw("jt.answer {$sqlOperator} ?", [$numericValue]);
                    });
                    break;

                case 'between':
                    if (!is_array($value) || count($value) !== 2 || !is_numeric($value[0]) || !is_numeric($value[1])) {
                        break; // Skip invalid between values
                    }

                    $q->whereExists(function ($subQuery) use ($jsonColumn, $field, $value) {
                        $subQuery->selectRaw('1')
                            ->fromRaw("JSON_TABLE({$jsonColumn}, \"$[*]\" COLUMNS (
                                         question_code VARCHAR(255) PATH \"$.question_code\",
                                         answer DECIMAL(10,2) PATH \"$.answer\"
                                     )) as jt")
                            ->where('jt.question_code', $field)
                            ->whereBetween('jt.answer', [(float)$value[0], (float)$value[1]]);
                    });
                    break;

                case 'not_between':
                    if (!is_array($value) || count($value) !== 2 || !is_numeric($value[0]) || !is_numeric($value[1])) {
                        break; // Skip invalid between values
                    }

                    $q->whereNotExists(function ($subQuery) use ($jsonColumn, $field, $value) {
                        $subQuery->selectRaw('1')
                            ->fromRaw("JSON_TABLE({$jsonColumn}, \"$[*]\" COLUMNS (
                                         question_code VARCHAR(255) PATH \"$.question_code\",
                                         answer DECIMAL(10,2) PATH \"$.answer\"
                                     )) as jt")
                            ->where('jt.question_code', $field)
                            ->whereBetween('jt.answer', [(float)$value[0], (float)$value[1]]);
                    });
                    break;

                default:
                    // Log unknown operator
                    Log::warning("Unknown JSON filter operator: {$condition}");
                    break;
            }
        });
    }

    /**
     * Apply filters to query builder
     *
     * @param Builder $query
     * @param array $filters
     * @return void
     */
    protected function applyFilters(Builder $query, array $filters): void
    {
        foreach ($filters as $filter) {
            if ($filter['is_json']) {
                $this->applyJsonFilter($query, $filter);
            } else {
                $this->applyRegularFilter($query, $filter);
            }
        }
    }

    /**
     * Apply regular (non-JSON) filter to query builder
     *
     * @param Builder $query
     * @param array $filter
     * @return void
     */
    protected function applyRegularFilter(Builder $query, array $filter): void
    {
        $column = $filter['column'];
        $value = $filter['value'];
        $condition = $filter['condition'];

        switch ($condition) {
            case 'eq':
                $query->where($column, '=', $value);
                break;

            case 'neq':
                $query->where($column, '!=', $value);
                break;

            case 'like':
                $query->where($column, 'LIKE', "%{$value}%");
                break;

            case 'not_like':
                $query->where($column, 'NOT LIKE', "%{$value}%");
                break;

            case 'gt':
                $query->where($column, '>', $value);
                break;

            case 'gte':
                $query->where($column, '>=', $value);
                break;

            case 'lt':
                $query->where($column, '<', $value);
                break;

            case 'lte':
                $query->where($column, '<=', $value);
                break;

            case 'in':
                $values = explode(',', $value);
                $values = array_map('trim', $values);
                $query->whereIn($column, $values);
                break;

            case 'not_in':
                $values = explode(',', $value);
                $values = array_map('trim', $values);
                $query->whereNotIn($column, $values);
                break;

            case 'null':
                $query->whereNull($column);
                break;

            case 'not_null':
                $query->whereNotNull($column);
                break;

            case 'between':
                $values = explode(',', $value);
                if (count($values) === 2) {
                    $query->whereBetween($column, [trim($values[0]), trim($values[1])]);
                }
                break;

            case 'not_between':
                $values = explode(',', $value);
                if (count($values) === 2) {
                    $query->whereNotBetween($column, [trim($values[0]), trim($values[1])]);
                }
                break;
        }
    }

    /**
     * Apply pagination to query builder
     *
     * @param Builder $query
     * @param array $paginationParams
     * @param array $searchableFields
     * @return array
     */
    protected function paginateQuery(Builder $query, array $paginationParams, array $searchableFields = []): array
    {
        // Apply regular filters first
        if (!empty($paginationParams['filters'])) {
            $this->applyFilters($query, $paginationParams['filters']);
        }

        // Apply JSON filters
        if (!empty($paginationParams['json_filters'])) {
            $this->applyFilters($query, $paginationParams['json_filters']);
        }

        // Apply search if provided
        if (!empty($paginationParams['search']) && !empty($searchableFields)) {
            $search = $paginationParams['search'];
            $query->where(function ($q) use ($search, $searchableFields) {
                foreach ($searchableFields as $field) {
                    $q->orWhere($field, 'LIKE', "%{$search}%");
                }
            });
        }

        // Apply sorting
        $query->orderBy($paginationParams['sort_by'], $paginationParams['order']);

        // Get total count before pagination
        $total = $query->count();

        // Apply pagination
        $offset = ($paginationParams['page'] - 1) * $paginationParams['limit'];
        $data = $query->offset($offset)->limit($paginationParams['limit'])->get();

        // Calculate pagination metadata
        $totalPages = ceil($total / $paginationParams['limit']);
        $hasNextPage = $paginationParams['page'] < $totalPages;
        $hasPrevPage = $paginationParams['page'] > 1;

        return [
            'data' => $data,
            'pagination' => [
                'current_page' => $paginationParams['page'],
                'per_page' => $paginationParams['limit'],
                'total' => $total,
                'total_pages' => $totalPages,
                'has_next_page' => $hasNextPage,
                'has_prev_page' => $hasPrevPage,
                'next_page' => $hasNextPage ? $paginationParams['page'] + 1 : null,
                'prev_page' => $hasPrevPage ? $paginationParams['page'] - 1 : null,
            ],
            'filters' => [
                'search' => $paginationParams['search'],
                'sort_by' => $paginationParams['sort_by'],
                'order' => $paginationParams['order'],
                'applied_filters' => $paginationParams['filters'] ?? [],
                'applied_json_filters' => $paginationParams['json_filters'] ?? [],
            ]
        ];
    }

    /**
     * Format paginated response
     *
     * @param array $result
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    protected function paginatedResponse(array $result, string $message = 'Data retrieved successfully')
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $result['data'],
            'pagination' => $result['pagination'],
            'filters' => $result['filters'],
        ], 200);
    }
}
