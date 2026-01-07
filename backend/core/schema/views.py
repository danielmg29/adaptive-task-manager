"""
Schema API Views

HTTP endpoints that expose model schemas as JSON.
These endpoints power the frontend's dynamic UI generation.
"""

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .introspection import (
    get_model_schema,
    get_all_models_schema,
    get_model_by_name
)


@require_http_methods(["GET"])
def get_schema_view(request, model_name: str):
    """
    Get schema for a specific model.
    
    GET /api/schema/Task
    
    Returns:
        JSON schema for the Task model
    """
    
    model_class = get_model_by_name(model_name)
    
    if not model_class:
        return JsonResponse(
            {'error': f'Model "{model_name}" not found'},
            status=404
        )
    
    schema = get_model_schema(model_class)
    return JsonResponse(schema, safe=False)


@require_http_methods(["GET"])
def get_all_schemas_view(request):
    """
    Get schemas for all models.
    
    GET /api/schema/all
    
    Returns:
        JSON object with all model schemas
    """
    
    schemas = get_all_models_schema()
    return JsonResponse(schemas, safe=False)