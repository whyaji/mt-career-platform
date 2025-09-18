<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

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

        return [
            'page' => $page,
            'limit' => $limit,
            'order' => $order,
            'sort_by' => $sortBy,
            'search' => $search,
            'filters' => $filters,
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

            $filters[] = [
                'column' => $column,
                'value' => $value,
                'condition' => $condition,
            ];
        }

        return $filters;
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
        // Apply filters first
        if (!empty($paginationParams['filters'])) {
            $this->applyFilters($query, $paginationParams['filters']);
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
                'applied_filters' => $paginationParams['filters'],
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
