/**
 * useCRUD Hook
 * 
 * Generic hook for CRUD operations with React Query.
 * Provides caching, optimistic updates, and automatic refetching.
 * 
 * Adaptive Convergence Principle:
 * One hook works for ALL models with optimal performance.
 */

'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

interface PaginatedResponse {
  data: any[];
  page: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

interface UseCRUDOptions {
  page?: number;
  pageSize?: number;
  filters?: Record<string, any>;
  enabled?: boolean;
}

export function useCRUD(modelName: string, options: UseCRUDOptions = {}) {
  const queryClient = useQueryClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const {
    page = 1,
    pageSize = 10,
    filters = {},
    enabled = true,
  } = options;

  // Build query key (unique identifier for this query)
  const queryKey = ['model', modelName, { page, pageSize, filters }];

  // ===============================================
  // QUERY: Fetch list of items
  // ===============================================
  const query = useQuery<PaginatedResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        ...filters,
      });

      const response = await fetch(
        `${apiUrl}/api/${modelName}/?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      return response.json();
    },
    enabled,
  });

  // ===============================================
  // MUTATION: Create new item
  // ===============================================
  const createMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await fetch(`${apiUrl}/api/${modelName}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create item');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['model', modelName] });
    },
  });

  // ===============================================
  // MUTATION: Update existing item
  // ===============================================
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Record<string, any>;
    }) => {
      const response = await fetch(`${apiUrl}/api/${modelName}/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update item');
      }

      return response.json();
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<PaginatedResponse>(queryKey);

      // Optimistically update cache
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse>(queryKey, {
          ...previousData,
          data: previousData.data.map((item) =>
            item.id === id ? { ...item, ...data } : item
          ),
        });
      }

      // Return context with snapshot
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['model', modelName] });
    },
  });

  // ===============================================
  // MUTATION: Delete item
  // ===============================================
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${apiUrl}/api/${modelName}/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      return { id };
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<PaginatedResponse>(queryKey);

      // Optimistically remove from cache
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse>(queryKey, {
          ...previousData,
          data: previousData.data.filter((item) => item.id !== id),
          total_count: previousData.total_count - 1,
        });
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['model', modelName] });
    },
  });

  return {
    // Query data
    data: query.data?.data || [],
    pagination: {
      page: query.data?.page || 1,
      totalPages: query.data?.total_pages || 1,
      totalCount: query.data?.total_count || 0,
      hasNext: query.data?.has_next || false,
      hasPrevious: query.data?.has_previous || false,
    },
    
    // Query state
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    
    // Mutations
    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: deleteMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Manual refetch
    refetch: query.refetch,
  };
}