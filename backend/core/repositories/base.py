"""
Generic Repository Pattern (Functional Approach)

This module provides pure functions for CRUD operations
that work with ANY Django model.

Adaptive Convergence Principle:
- No classes, no inheritance, no OOP overhead
- Pure functions = easy to test, easy to reason about
- One repository factory works for unlimited models
"""

from typing import Type, TypeVar, Optional, Dict, Any, List
from django.db.models import Model, QuerySet
from django.core.paginator import Paginator
from django.core.exceptions import ValidationError

# Type variable for generic model typing
T = TypeVar('T', bound=Model)


def create_repository(model_class: Type[T]) -> Dict[str, Any]:
    """
    Factory function that creates a repository for ANY Django model.
    
    This is the heart of Adaptive Convergence's zero-redundancy principle.
    Instead of writing a repository class for each model,
    we generate repository functions dynamically.
    
    Args:
        model_class: Any Django model class (Task, User, Project, etc.)
        
    Returns:
        Dictionary of CRUD functions bound to the model
        
    Example:
        task_repo = create_repository(Task)
        tasks = task_repo['get_all']()
        task = task_repo['create']({'title': 'Learn Django'})
    """
    
    def get_all(
        filters: Optional[Dict[str, Any]] = None,
        page: int = 1,
        page_size: int = 10,
        ordering: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Get all instances with optional filtering and pagination.
        
        Args:
            filters: Django ORM filter kwargs (e.g., {'completed': True})
            page: Page number (1-indexed)
            page_size: Number of items per page
            ordering: List of fields to order by (e.g., ['-created_at'])
            
        Returns:
            Dictionary containing:
                - data: List of model instances as dicts
                - page: Current page number
                - total_pages: Total number of pages
                - total_count: Total number of items
        """
        # Start with all objects
        queryset = model_class.objects.all()
        
        # Apply filters if provided
        if filters:
            queryset = queryset.filter(**filters)
        
        # Apply ordering
        if ordering:
            queryset = queryset.order_by(*ordering)
        
        # Paginate results
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        # Convert QuerySet to list of dicts
        data = list(page_obj.object_list.values())
        
        return {
            'data': data,
            'page': page,
            'total_pages': paginator.num_pages,
            'total_count': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        }
    
    def get_by_id(id: int) -> Optional[T]:
        """
        Get a single instance by ID.
        
        Args:
            id: Primary key value
            
        Returns:
            Model instance or None if not found
        """
        try:
            return model_class.objects.get(pk=id)
        except model_class.DoesNotExist:
            return None
    
    def create(data: Dict[str, Any]) -> T:
        """
        Create a new instance.
        
        Args:
            data: Dictionary of field values
            
        Returns:
            Created model instance
            
        Raises:
            ValidationError: If data is invalid
        """
        # Create instance (doesn't save to database yet)
        instance = model_class(**data)
        
        # Validate before saving
        instance.full_clean()
        
        # Save to database
        instance.save()
        
        return instance
    
    def update(id: int, data: Dict[str, Any]) -> Optional[T]:
        """
        Update an existing instance.
        
        Args:
            id: Primary key value
            data: Dictionary of fields to update
            
        Returns:
            Updated model instance or None if not found
            
        Raises:
            ValidationError: If data is invalid
        """
        # Get existing instance
        instance = get_by_id(id)
        
        if not instance:
            return None
        
        # Update fields
        for key, value in data.items():
            setattr(instance, key, value)
        
        # Validate before saving
        instance.full_clean()
        
        # Save to database
        instance.save()
        
        return instance
    
    def delete(id: int) -> bool:
        """
        Delete an instance.
        
        Args:
            id: Primary key value
            
        Returns:
            True if deleted, False if not found
        """
        instance = get_by_id(id)
        
        if not instance:
            return False
        
        instance.delete()
        return True
    
    def bulk_create(data_list: List[Dict[str, Any]]) -> List[T]:
        """
        Create multiple instances efficiently.
        
        Args:
            data_list: List of dictionaries with field values
            
        Returns:
            List of created model instances
        """
        instances = [model_class(**data) for data in data_list]
        
        # Validate all instances
        for instance in instances:
            instance.full_clean()
        
        # Bulk insert (single database query)
        created = model_class.objects.bulk_create(instances)
        return created
    
    def count(filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Count instances with optional filtering.
        
        Args:
            filters: Django ORM filter kwargs
            
        Returns:
            Number of matching instances
        """
        queryset = model_class.objects.all()
        
        if filters:
            queryset = queryset.filter(**filters)
        
        return queryset.count()
    
    # Return dictionary of functions
    return {
        'get_all': get_all,
        'get_by_id': get_by_id,
        'create': create,
        'update': update,
        'delete': delete,
        'bulk_create': bulk_create,
        'count': count,
        'model_class': model_class,
    }