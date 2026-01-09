"""
API View Tests

Test dynamic CRUD endpoints.
"""

import pytest
import json
from django.test import Client
from core.models import Task


@pytest.fixture
def client():
    """Django test client"""
    return Client()


@pytest.mark.django_db
class TestDynamicCRUDViews:
    """Test dynamic CRUD API endpoints"""
    
    def test_list_tasks_empty(self, client):
        """Test listing tasks when none exist"""
        response = client.get('/api/Task/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['total_count'] == 0
        assert data['data'] == []
    
    def test_list_tasks(self, client, multiple_tasks):
        """Test listing tasks"""
        response = client.get('/api/Task/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['total_count'] == 5
        assert len(data['data']) == 5
    
    def test_list_tasks_with_filters(self, client, multiple_tasks):
        """Test filtering tasks"""
        response = client.get('/api/Task/?completed=true')
        
        assert response.status_code == 200
        data = response.json()
        assert data['total_count'] == 3
    
    def test_list_tasks_with_pagination(self, client, multiple_tasks):
        """Test pagination"""
        response = client.get('/api/Task/?page=1&page_size=2')
        
        assert response.status_code == 200
        data = response.json()
        assert len(data['data']) == 2
        assert data['total_pages'] == 3
    
    def test_create_task(self, client, sample_task_data):
        """Test creating a task via API"""
        response = client.post(
            '/api/Task/',
            data=json.dumps(sample_task_data),
            content_type='application/json',
        )
        
        assert response.status_code == 201
        data = response.json()
        assert 'id' in data
        assert data['title'] == sample_task_data['title']
    
    def test_create_task_invalid_data(self, client):
        """Test creating task with invalid data"""
        invalid_data = {
            'title': 'A' * 300,  # Exceeds max_length
        }
        
        response = client.post(
            '/api/Task/',
            data=json.dumps(invalid_data),
            content_type='application/json',
        )
        
        assert response.status_code == 400
        data = response.json()
        assert 'error' in data
    
    def test_get_task_detail(self, client, created_task):
        """Test retrieving single task"""
        response = client.get(f'/api/Task/{created_task.id}/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['id'] == created_task.id
        assert data['title'] == created_task.title
    
    def test_get_task_detail_not_found(self, client):
        """Test retrieving non-existent task"""
        response = client.get('/api/Task/99999/')
        
        assert response.status_code == 404
    
    def test_update_task(self, client, created_task):
        """Test updating a task"""
        update_data = {
            'title': 'Updated Title',
            'completed': True,
            'priority': 'high',
        }
        
        response = client.put(
            f'/api/Task/{created_task.id}/',
            data=json.dumps(update_data),
            content_type='application/json',
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['title'] == 'Updated Title'
        assert data['completed'] is True
    
    def test_delete_task(self, client, created_task):
        """Test deleting a task"""
        response = client.delete(f'/api/Task/{created_task.id}/')
        
        assert response.status_code == 204
        
        # Verify it's gone
        Task.objects.get(id=created_task.id)  # Should raise DoesNotExist
    
    def test_schema_endpoint(self, client):
        """Test schema introspection endpoint"""
        response = client.get('/api/schema/Task/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['model_name'] == 'Task'
        assert 'fields' in data