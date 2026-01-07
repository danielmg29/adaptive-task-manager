"""
Dynamic CRUD Views

Single set of views that handle ALL models automatically.
This is the culmination of Adaptive Convergence principles.

Traditional Django: 1 ViewSet per model × 100 models = 100 ViewSets
Adaptive Convergence: 1 handler for ALL models = Zero redundancy
"""

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from functools import lru_cache
import json

from core.repositories.base import create_repository
from core.schema.introspection import get_model_by_name


@lru_cache(maxsize=128)
def get_repository(model_name: str):
    """
    Get or create a cached repository for a model.
    
    The @lru_cache decorator caches repositories to avoid
    recreating them on every request (performance optimization).
    
    Args:
        model_name: Name of the model (e.g., 'Task')
        
    Returns:
        Repository dictionary with CRUD functions
        
    Raises:
        LookupError: If model doesn't exist
    """
    model_class = get_model_by_name(model_name)
    
    if not model_class:
        raise LookupError(f'Model "{model_name}" not found')
    
    return create_repository(model_class)


def serialize_instance(instance) -> dict:
    """
    Convert a model instance to a JSON-serializable dictionary.
    
    Args:
        instance: Django model instance
        
    Returns:
        Dictionary representation
    """
    # Get all field values
    data = {}
    
    for field in instance._meta.get_fields():
        # Skip reverse relations
        if field.auto_created and field.is_relation:
            continue
        
        field_name = field.name
        value = getattr(instance, field_name)
        
        # Handle datetime objects (convert to ISO format)
        if hasattr(value, 'isoformat'):
            data[field_name] = value.isoformat()
        else:
            data[field_name] = value
    
    return data


@csrf_exempt
@require_http_methods(["GET", "POST"])
def dynamic_list_handler(request, model_name: str):
    """
    Handle list and create operations for any model.
    
    GET /api/Task  → List all tasks
    POST /api/Task → Create a new task
    
    This single endpoint works for Task, User, Project, or any model!
    """
    
    # Get repository for this model
    try:
        repository = get_repository(model_name)
    except LookupError:
        return JsonResponse(
            {'error': f'Model "{model_name}" not found'},
            status=404
        )
    
    # Handle GET request (list)
    if request.method == 'GET':
        # Extract query parameters
        filters = {}
        for key, value in request.GET.items():
            if key not in ['page', 'page_size', 'ordering']:
                filters[key] = value
        
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 50))
        
        # Get ordering from query params
        ordering = None
        if 'ordering' in request.GET:
            ordering = request.GET.get('ordering').split(',')
        
        # Get data from repository
        result = repository['get_all'](
            filters=filters if filters else None,
            page=page,
            page_size=page_size,
            ordering=ordering
        )
        
        return JsonResponse(result, safe=False)
    
    # Handle POST request (create)
    elif request.method == 'POST':
        try:
            # Parse JSON body
            data = json.loads(request.body)
            
            # Create instance via repository
            instance = repository['create'](data)
            
            # Serialize and return
            serialized = serialize_instance(instance)
            
            return JsonResponse(
                serialized,
                status=201  # 201 Created
            )
            
        except json.JSONDecodeError:
            return JsonResponse(
                {'error': 'Invalid JSON'},
                status=400
            )
        
        except ValidationError as e:
            return JsonResponse(
                {'error': 'Validation error', 'details': e.message_dict},
                status=400
            )
        
        except Exception as e:
            return JsonResponse(
                {'error': str(e)},
                status=500
            )


@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH", "DELETE"])
def dynamic_detail_handler(request, model_name: str, pk: int):
    """
    Handle retrieve, update, and delete operations for any model.
    
    GET    /api/Task/1 → Get task #1
    PUT    /api/Task/1 → Update task #1 (full update)
    PATCH  /api/Task/1 → Update task #1 (partial update)
    DELETE /api/Task/1 → Delete task #1
    """
    
    # Get repository for this model
    try:
        repository = get_repository(model_name)
    except LookupError:
        return JsonResponse(
            {'error': f'Model "{model_name}" not found'},
            status=404
        )
    
    # Handle GET request (retrieve)
    if request.method == 'GET':
        instance = repository['get_by_id'](pk)
        
        if not instance:
            return JsonResponse(
                {'error': 'Not found'},
                status=404
            )
        
        serialized = serialize_instance(instance)
        return JsonResponse(serialized)
    
    # Handle PUT/PATCH request (update)
    elif request.method in ['PUT', 'PATCH']:
        try:
            data = json.loads(request.body)
            
            instance = repository['update'](pk, data)
            
            if not instance:
                return JsonResponse(
                    {'error': 'Not found'},
                    status=404
                )
            
            serialized = serialize_instance(instance)
            return JsonResponse(serialized)
            
        except json.JSONDecodeError:
            return JsonResponse(
                {'error': 'Invalid JSON'},
                status=400
            )
        
        except ValidationError as e:
            return JsonResponse(
                {'error': 'Validation error', 'details': e.message_dict},
                status=400
            )
        
        except Exception as e:
            return JsonResponse(
                {'error': str(e)},
                status=500
            )
    
    # Handle DELETE request
    elif request.method == 'DELETE':
        success = repository['delete'](pk)
        
        if not success:
            return JsonResponse(
                {'error': 'Not found'},
                status=404
            )
        
        return JsonResponse(
            {'success': True},
            status=204  # 204 No Content
        )