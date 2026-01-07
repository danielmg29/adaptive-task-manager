# WHAT: URL routing for core app
# WHY: Maps URLs to views (like a phone directory)

from django.urls import path
from .schema.views import get_schema_view, get_all_schemas_view
from .views.dynamic import dynamic_list_handler, dynamic_detail_handler

# WHY: Register the app in which the schema urls have been registered
app_name = 'core'

urlpatterns = [
    path('schema/<str:model_name>/', get_schema_view, name='schema'),
    path('schema/all/', get_all_schemas_view, name='all-schemas'),

    # Dynamic CRUD endpoints
    path('<str:model_name>/', dynamic_list_handler, name='model-list'),
    path('<str:model_name>/<int:pk>/', dynamic_detail_handler, name='model-detail'),
]