"""
Schema Introspection Tests

Test schema extraction functionality.
"""

import pytest
from core.schema.introspection import (
    get_field_schema,
    get_model_schema,
    get_all_models_schema,
    get_model_by_name,
)
from core.models import Task


class TestSchemaIntrospection:
    """Test schema introspection functions"""
    
    def test_get_model_schema(self):
        """Test extracting complete model schema"""
        schema = get_model_schema(Task)
        
        assert schema['model_name'] == 'Task'
        assert schema['app_label'] == 'tasks'
        assert 'fields' in schema
        
        # Check required fields are present
        field_names = [f['name'] for f in schema['fields']]
        assert 'title' in field_names
        assert 'description' in field_names
        assert 'completed' in field_names
        assert 'priority' in field_names
    
    def test_field_schema_char_field(self):
        """Test CharField schema extraction"""
        schema = get_model_schema(Task)
        
        title_field = next(f for f in schema['fields'] if f['name'] == 'title')
        
        assert title_field['type'] == 'CharField'
        assert title_field['required'] is True
        assert title_field['max_length'] == 200
        assert 'help_text' in title_field
    
    def test_field_schema_with_choices(self):
        """Test field with choices"""
        schema = get_model_schema(Task)
        
        priority_field = next(f for f in schema['fields'] if f['name'] == 'priority')
        
        assert priority_field['type'] == 'CharField'
        assert 'choices' in priority_field
        assert len(priority_field['choices']) == 3
        
        # Verify choice structure
        choice_values = [c['value'] for c in priority_field['choices']]
        assert 'low' in choice_values
        assert 'medium' in choice_values
        assert 'high' in choice_values
    
    def test_field_schema_boolean(self):
        """Test BooleanField schema"""
        schema = get_model_schema(Task)
        
        completed_field = next(f for f in schema['fields'] if f['name'] == 'completed')
        
        assert completed_field['type'] == 'BooleanField'
        assert completed_field['default'] is False
    
    def test_get_all_models_schema(self):
        """Test getting all model schemas"""
        schemas = get_all_models_schema()
        
        assert 'Task' in schemas
        assert schemas['Task']['model_name'] == 'Task'
    
    def test_get_model_by_name(self):
        """Test retrieving model by name"""
        model = get_model_by_name('Task')
        
        assert model is not None
        assert model.__name__ == 'Task'
    
    def test_get_model_by_name_not_found(self):
        """Test retrieving non-existent model"""
        model = get_model_by_name('NonExistentModel')
        
        assert model is None