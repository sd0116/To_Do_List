from django.http import JsonResponse, QueryDict
from django.views.decorators.csrf import csrf_exempt
from .models import Task
from django.shortcuts import render
from . import views


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
    if request.method == 'DELETE':
        task = Task.objects.get(id=task_id)
        task.delete()
        return JsonResponse({"status": "success"})

# Función para actualizar una tarea
@csrf_exempt
def update_task(request, task_id):
    if request.method == 'PUT':
        task = Task.objects.get(id=task_id)
        # Django no maneja bien los datos PUT, por lo que usamos QueryDict para procesarlos
        put_data = QueryDict(request.body)
        new_title = put_data.get('title')
        if new_title:
            task.title = new_title
            task.save()
            return JsonResponse({"status": "success"})
        return JsonResponse({"status": "error", "message": "Title is required"}, status=400)
