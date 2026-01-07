"""
Schema Introspection Module

This module extracts complete schema information from Django models
and exposes it as JSON. This enables:
- Frontend to auto-generate forms
- API documentation to stay in sync
- Validation rules to be consistent
- Zero manual synchronization

Adaptive Convergence Principle:
The model is the SINGLE SOURCE OF TRUTH.
Everything else derives from it automatically.
"""

from django.apps import apps
from django.db import models
from typing import Dict, Any, List, Type, Optional


def get_field_schema(field) -> Dict[str, Any]:
    """
    Extract schema information from a single Django field.
    
    Args:
        field: Django model field instance
        
    Returns:
        Dictionary containing field metadata
    """
    
    # Handle relationship fields (ForeignKey, ManyToMany, etc.)
    if field.is_relation:
        return {
            'name': field.name,
            'type': 'relation',
            'related_model': field.related_model.__name__,
            'many': field.many_to_many or field.one_to_many,
            'required': not getattr(field, 'null', True),
        }
    
    # Handle regular fields (CharField, IntegerField, etc.)
    field_info = {
        'name': field.name,
        'type': field.get_internal_type(),
        'required': not getattr(field, 'blank', True) and not getattr(field, 'null', True),
        'help_text': field.help_text,
    }
    
    # Add field-specific attributes
    if hasattr(field, 'max_length') and field.max_length:
        field_info['max_length'] = field.max_length
    
    if hasattr(field, 'choices') and field.choices:
        field_info['choices'] = [
            {'value': choice[0], 'label': choice[1]}
            for choice in field.choices
        ]
    
    if hasattr(field, 'default') and field.default != models.NOT_PROVIDED:
        # Handle callable defaults
        if callable(field.default):
            field_info['default'] = None  # Can't serialize functions
        else:
            field_info['default'] = field.default
    
    return field_info


def get_model_schema(model_class: Type[models.Model]) -> Dict[str, Any]:
    """
    Extract complete schema information from a Django model.
    
    This is the core of Adaptive Convergence's schema-driven approach.
    The frontend will consume this to auto-generate UI components.
    
    Args:
        model_class: Django model class
        
    Returns:
        Dictionary containing complete model schema
    """
    
    fields_schema = []
    
    # Iterate through all fields in the model
    for field in model_class._meta.get_fields():
        # Skip reverse relations (we only want forward relations)
        if field.auto_created and field.is_relation:
            continue
            
        field_schema = get_field_schema(field)
        fields_schema.append(field_schema)
    
    return {
        'model_name': model_class.__name__,
        'app_label': model_class._meta.app_label,
        'table_name': model_class._meta.db_table,
        'fields': fields_schema,
        'verbose_name': str(model_class._meta.verbose_name),
        'verbose_name_plural': str(model_class._meta.verbose_name_plural),
    }


def get_all_models_schema() -> Dict[str, Dict[str, Any]]:
    """
    Get schema for all registered models in the Django project.
    
    This provides a complete API catalog automatically.
    
    Returns:
        Dictionary mapping model names to their schemas
    """
    
    schemas = {}
    
    # Iterate through all registered Django models
    for model in apps.get_models():
        # Skip abstract models (they're not real tables)
        if model._meta.abstract:
            continue
        
        # Skip Django's built-in models (optional - you can include them)
        if model._meta.app_label in ['admin', 'auth', 'contenttypes', 'sessions']:
            continue
        
        model_name = model.__name__
        schemas[model_name] = get_model_schema(model)
    
    return schemas


def get_model_by_name(model_name: str) -> Optional[Type[models.Model]]:
    """
    Safely retrieve a model class by name.
    
    Args:
        model_name: Name of the model (e.g., 'Task')
        
    Returns:
        Model class or None if not found
    """
    
    for model in apps.get_models():
        if model.__name__ == model_name and not model._meta.abstract:
            return model
    
    return None