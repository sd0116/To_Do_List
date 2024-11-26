from django.contrib import admin
from django.urls import path
from Lista import views

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', views.index, name='index'),  # Ruta para la página principal
    path('tasks/', views.get_tasks, name='get_tasks'),  # Esta ruta devuelve el JSON de las tareas
    path('add-task/', views.add_task, name='add_task'),
    path('delete-task/<int:task_id>/', views.delete_task, name='delete_task'),
    path('update-task/<int:task_id>/', views.update_task, name='update_task'),
    path('delete-tasks/', views.delete_multiple_tasks, name='delete_multiple_tasks'),  # Nueva ruta para eliminar múltiples tareas
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
