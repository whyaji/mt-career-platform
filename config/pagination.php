<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Pagination Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the default pagination settings for the application.
    | These settings can be overridden in individual controllers if needed.
    |
    */

    'defaults' => [
        'page' => 1,
        'limit' => 15,
        'order' => 'asc',
        'sort_by' => 'id',
    ],

    'limits' => [
        'min' => 1,
        'max' => 100,
    ],

    'orders' => [
        'asc',
        'desc',
    ],

    'search' => [
        'min_length' => 2,
        'max_length' => 100,
    ],

    'filters' => [
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
    ],
];
