# WHAT: This file defines our data structures
# WHY: Django uses this to create database tables automatically
# ADAPTIVE CONVERGENCE PRINCIPLE: Define once, use everywhere

from django.db import models

class Task(models.Model):
    """
    Represents a single task in our task manager.
    
    This is the SINGLE SOURCE OF TRUTH for task data structure.
    Everything else (API, forms, tables) will adapt to this definition.
    """
    
    # FIELD: title
    # TYPE: String with maximum 200 characters
    # REQUIRED: Yes (blank=False is default)
    title = models.CharField(max_length=200)
    
    # FIELD: description  
    # TYPE: Unlimited text
    # REQUIRED: No (blank=True means optional)
    description = models.TextField(blank=True)

    # FIELD: priority
    # TYPE: String with maximum 200 characters
    # REQUIRED: No (blank=True means optional)
    priority_choices = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    priority = models.CharField(
        max_length=200,
        blank=True,
        choices=priority_choices,
    )

    tags = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Comma-separated tags"
    )
    
    # FIELD: completed
    # TYPE: Boolean (True/False)
    # DEFAULT: False (new tasks start incomplete)
    completed = models.BooleanField(default=False)
    
    # FIELD: created_at
    # TYPE: DateTime
    # AUTO: Set automatically when task is created
    created_at = models.DateTimeField(auto_now_add=True)
    
    # FIELD: updated_at
    # TYPE: DateTime  
    # AUTO: Updates automatically whenever task is modified
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # ORDER: Show newest tasks first
        ordering = ['-created_at']  # The minus sign means descending
    
    def __str__(self):
        # DISPLAY: How this object appears in Django admin and logs
        return self.title