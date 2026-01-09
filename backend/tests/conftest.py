"""
Test Fixtures

Pytest fixtures provide reusable test data and setup.
"""

import pytest
from core.models import Task
from django.utils import timezone


@pytest.fixture
def sample_task_data():
    """Sample task data for testing"""
    return {
        'title': 'Test Task',
        'description': 'Test Description',
        'completed': False,
        'priority': 'medium',
    }


@pytest.fixture
def created_task(sample_task_data):
    """Create a task in the database"""
    task = Task.objects.create(**sample_task_data)
    return task


@pytest.fixture
def multiple_tasks():
    """Create multiple tasks for testing lists"""
    tasks = []
    for i in range(5):
        task = Task.objects.create(
            title=f'Task {i+1}',
            description=f'Description {i+1}',
            completed=i % 2 == 0,  # Alternate completed status
            priority=['low', 'medium', 'high'][i % 3],
        )
        tasks.append(task)
    return tasks