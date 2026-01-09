"""
Repository Tests

Test the generic repository pattern.
"""

import pytest
from django.core.exceptions import ValidationError
from core.repositories.base import create_repository
from core.models import Task


@pytest.mark.django_db
class TestTaskRepository:
    """Test Task repository CRUD operations"""
    
    def test_create_task(self, sample_task_data):
        """Test creating a task via repository"""
        repo = create_repository(Task)
        
        task = repo['create'](sample_task_data)
        
        assert task.id is not None
        assert task.title == sample_task_data['title']
        assert task.completed == sample_task_data['completed']
        assert task.priority == sample_task_data['priority']
    
    def test_create_task_with_validation_error(self):
        """Test creating task with invalid data"""
        repo = create_repository(Task)
        
        # Title too long (max_length=200)
        invalid_data = {
            'title': 'A' * 300,
            'completed': False,
        }
        
        with pytest.raises(ValidationError):
            repo['create'](invalid_data)
    
    def test_get_by_id(self, created_task):
        """Test retrieving task by ID"""
        repo = create_repository(Task)
        
        task = repo['get_by_id'](created_task.id)
        
        assert task is not None
        assert task.id == created_task.id
        assert task.title == created_task.title
    
    def test_get_by_id_not_found(self):
        """Test retrieving non-existent task"""
        repo = create_repository(Task)
        
        task = repo['get_by_id'](99999)
        
        assert task is None
    
    def test_get_all(self, multiple_tasks):
        """Test getting all tasks"""
        repo = create_repository(Task)
        
        result = repo['get_all']()
        
        assert result['total_count'] == 5
        assert len(result['data']) == 5
        assert result['page'] == 1
    
    def test_get_all_with_filters(self, multiple_tasks):
        """Test filtering tasks"""
        repo = create_repository(Task)
        
        result = repo['get_all'](filters={'completed': True})
        
        # We created 5 tasks, alternating completed status
        # Tasks 0, 2, 4 are completed (3 tasks)
        assert result['total_count'] == 3
    
    def test_get_all_with_pagination(self, multiple_tasks):
        """Test pagination"""
        repo = create_repository(Task)
        
        # Get page 1 with page_size=2
        result = repo['get_all'](page=1, page_size=2)
        
        assert len(result['data']) == 2
        assert result['total_pages'] == 3
        assert result['has_next'] is True
        assert result['has_previous'] is False
    
    def test_update_task(self, created_task):
        """Test updating a task"""
        repo = create_repository(Task)
        
        updated_data = {
            'title': 'Updated Title',
            'completed': True,
        }
        
        task = repo['update'](created_task.id, updated_data)
        
        assert task is not None
        assert task.title == 'Updated Title'
        assert task.completed is True
    
    def test_update_nonexistent_task(self):
        """Test updating task that doesn't exist"""
        repo = create_repository(Task)
        
        result = repo['update'](99999, {'title': 'New Title'})
        
        assert result is None
    
    def test_delete_task(self, created_task):
        """Test deleting a task"""
        repo = create_repository(Task)
        
        success = repo['delete'](created_task.id)
        
        assert success is True
        
        # Verify it's gone
        task = repo['get_by_id'](created_task.id)
        assert task is None
    
    def test_delete_nonexistent_task(self):
        """Test deleting task that doesn't exist"""
        repo = create_repository(Task)
        
        success = repo['delete'](99999)
        
        assert success is False
    
    def test_bulk_create(self):
        """Test bulk creating tasks"""
        repo = create_repository(Task)
        
        data_list = [
            {'title': f'Bulk Task {i}', 'completed': False, 'priority': 'low'}
            for i in range(3)
        ]
        
        tasks = repo['bulk_create'](data_list)
        
        assert len(tasks) == 3
        assert all(task.id is not None for task in tasks)
    
    def test_count(self, multiple_tasks):
        """Test counting tasks"""
        repo = create_repository(Task)
        
        # Count all
        total = repo['count']()
        assert total == 5
        
        # Count with filter
        completed_count = repo['count'](filters={'completed': True})
        assert completed_count == 3