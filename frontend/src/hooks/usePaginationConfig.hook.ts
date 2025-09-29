import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  AppliedFilter,
  DefaultPaginationSearch,
  PaginationParams,
} from '@/types/pagination.type';

export const usePaginationConfig = ({
  search,
  navigate,
}: {
  search: DefaultPaginationSearch;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigate: any;
}) => {
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([]);
  const [appliedJsonFilters, setAppliedJsonFilters] = useState<AppliedFilter[]>([]);
  const searchRef = useRef(search);

  // Update search ref whenever search changes
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  // Convert search params to query params
  const queryParams: PaginationParams = {
    page: search.page,
    limit: search.limit,
    search: search.search,
    sort_by: search.sort_by,
    order: search.order,
    filter: search.filter,
    json_filters: search.json_filters,
  };

  // Navigation helper
  const updateSearchParams = useCallback(
    (updates: Partial<DefaultPaginationSearch>) => {
      const newSearch = {
        ...searchRef.current,
        ...updates,
      };
      // Trigger router update
      navigate({
        search: newSearch,
      });
    },
    [navigate]
  );

  // Parse filter string from URL params on mount
  useEffect(() => {
    if (search.filter) {
      const filters = search.filter.split(';').map((filterStr) => {
        const [column, value, condition] = filterStr.split(':');
        return { column, value, condition };
      });
      setAppliedFilters(filters);
    } else {
      setAppliedFilters([]);
    }
  }, [search.filter]);

  // Parse json_filters string from URL params on mount
  useEffect(() => {
    if (search.json_filters) {
      const filters = search.json_filters.split(';').map((filterStr) => {
        const [column, value, condition] = filterStr.split(':');
        return { column, value, condition };
      });
      setAppliedJsonFilters(filters);
    } else {
      setAppliedJsonFilters([]);
    }
  }, [search.json_filters]);

  // Build filter string from applied filters
  const buildFilterString = (filters: AppliedFilter[]): string => {
    return filters
      .map((filter) => `${filter.column}:${filter.value}:${filter.condition}`)
      .join(';');
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  // Handle sort change
  const handleSortChange = (column: string, order: 'asc' | 'desc') => {
    updateSearchParams({
      sort_by: column,
      order,
      page: 1, // Reset to first page when sorting
    });
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    updateSearchParams({
      search: value || undefined,
      page: 1, // Reset to first page when searching
    });
  };

  const [tempSearch, setTempSearch] = useState('');

  // debounce tempsearch to search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearchChange(tempSearch);
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempSearch]);

  // Handle filter add
  const handleFilterAdd = (filter: AppliedFilter) => {
    const newFilters = [...appliedFilters, filter];
    setAppliedFilters(newFilters);
    updateSearchParams({
      filter: buildFilterString(newFilters),
      page: 1, // Reset to first page when filtering
    });
  };

  // Handle filter remove
  const handleFilterRemove = (index: number) => {
    const newFilters = appliedFilters.filter((_, i) => i !== index);
    setAppliedFilters(newFilters);
    updateSearchParams({
      filter: newFilters.length > 0 ? buildFilterString(newFilters) : undefined,
      page: 1, // Reset to first page when filtering
    });
  };

  // Handle filter clear
  const handleFilterClear = () => {
    setAppliedFilters([]);
    updateSearchParams({
      filter: undefined,
      page: 1, // Reset to first page when clearing filters
    });
  };

  // Handle json filter add
  const handleJsonFilterAdd = (filter: AppliedFilter) => {
    const newFilters = [...appliedJsonFilters, filter];
    setAppliedJsonFilters(newFilters);
    updateSearchParams({
      json_filters: buildFilterString(newFilters),
      page: 1, // Reset to first page when filtering
    });
  };

  // Handle json filter remove
  const handleJsonFilterRemove = (index: number) => {
    const newFilters = appliedJsonFilters.filter((_, i) => i !== index);
    setAppliedJsonFilters(newFilters);
    updateSearchParams({
      json_filters: newFilters.length > 0 ? buildFilterString(newFilters) : undefined,
      page: 1, // Reset to first page when filtering
    });
  };

  // Handle json filter clear
  const handleJsonFilterClear = () => {
    setAppliedJsonFilters([]);
    updateSearchParams({
      json_filters: undefined,
      page: 1, // Reset to first page when clearing filters
    });
  };

  // Handle page size change
  const handlePageSizeChange = (newLimit: number) => {
    const currentPage = searchRef.current.page;
    const currentLimit = searchRef.current.limit;

    // Calculate the new page based on current position
    // Formula: newPage = Math.ceil(((currentPage - 1) * currentLimit + 1) / newLimit)
    const firstItemIndex = (currentPage - 1) * currentLimit;
    const newPage = Math.ceil((firstItemIndex + 1) / newLimit);

    updateSearchParams({
      limit: newLimit,
      page: newPage,
    });
  };

  return {
    tempSearch,
    setTempSearch,
    appliedFilters,
    appliedJsonFilters,
    queryParams,
    handlePageChange,
    handleSortChange,
    handleFilterAdd,
    handleFilterRemove,
    handleFilterClear,
    handleJsonFilterAdd,
    handleJsonFilterRemove,
    handleJsonFilterClear,
    handlePageSizeChange,
  };
};
