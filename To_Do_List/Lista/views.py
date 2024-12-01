from django.http import JsonResponse, QueryDict
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from .models import Task
from django.shortcuts import render
import json

def index(request):
    return render(request, 'index.html')


# Función para obtener todas las tareas
def get_tasks(request):
    tasks = Task.objects.all().values('id', 'title')
    return JsonResponse(list(tasks), safe=False)

# Función para añadir una nueva tarea
@csrf_exempt
def add_task(request):
    if request.method == 'POST':
        task_title = request.POST.get('task')
        new_task = Task.objects.create(title=task_title)
        return JsonResponse({"status": "success", "task": new_task.title})

# Función para eliminar una tarea
@csrf_exempt
def delete_task(request, task_id):
    if request.method == 'POST':
        task_ids = request.POST.getlist('task_ids[]')  # Cambiar según cómo se envíen los datos
        Task.objects.filter(id__in=task_ids).delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

# Función para actualizar una tarea
@csrf_exempt
def update_task(request, task_id):
    if request.method == 'POST':
        task = get_object_or_404(Task, id=task_id)
        title = request.POST.get('title')
        if title:
            task.title = title
            task.save()
            return JsonResponse({'status': 'success', 'id': task.id, 'title': task.title})
        return JsonResponse({'status': 'error', 'message': 'Título no proporcionado'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

# Función para eliminar múltiples tareas
@csrf_exempt
def delete_multiple_tasks(request):
    if request.method == 'POST':
        task_ids = request.POST.getlist('task_ids[]')
        if task_ids:
            Task.objects.filter(id__in=task_ids).delete()
            return JsonResponse({'status': 'success'})
        return JsonResponse({'status': 'error', 'message': 'No se proporcionaron IDs'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

