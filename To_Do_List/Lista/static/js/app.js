document.addEventListener('DOMContentLoaded', function () {
    loadTasks();

    // Cargar tareas
    function loadTasks() {
        fetch('/tasks/')
            .then(response => response.json())
            .then(tasks => {
                const taskList = document.getElementById('task-list');
                taskList.innerHTML = '';
                tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <input type="checkbox" class="task-checkbox" data-id="${task.id}">
                        <span class="task-title">${task.title}</span>
                        <button class="edit-task" data-id="${task.id}" data-title="${task.title}">Editar</button>
                        <button class="delete-task" data-id="${task.id}">Eliminar</button>
                    `;
                    taskList.appendChild(li);
                });
            })
            .catch(error => console.error('Error al cargar tareas:', error));
    }

    // Agregar tarea
    document.getElementById('task-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const task = document.getElementById('task').value;

        if (navigator.onLine) {
            fetch('/add-task/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ task: task }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        loadTasks();
                        document.getElementById('task').value = '';
                    }
                })
                .catch(error => console.error('Error al enviar la tarea:', error));
        } else {
            alert('No se puede agregar tareas mientras estás offline.');
        }
    });

    // Eliminar tareas seleccionadas
    document.getElementById('delete-selected').addEventListener('click', function () {
        const selectedTasks = Array.from(document.querySelectorAll('.task-checkbox:checked')).map(cb => cb.dataset.id);
    
        if (selectedTasks.length > 0) {
            fetch('/delete-tasks/', { // Coincide con delete_multiple_tasks
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task_ids: selectedTasks }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'success') {
                        console.log('Tareas eliminadas:', selectedTasks);
                        loadTasks();
                    } else {
                        console.error('Error al eliminar tareas:', data.message);
                    }
                })
                .catch(error => console.error('Error al eliminar tareas:', error));
        } else {
            alert('Por favor, selecciona al menos una tarea para eliminar.');
        }
    });

    // Editar tareas
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('edit-task')) {
            const taskId = e.target.dataset.id;
            const taskTitle = prompt('Edita la tarea:', e.target.dataset.title);
    
            if (taskTitle !== null) {
                fetch(`/update-task/${taskId}/`, { // Cambiado para coincidir con urls.py
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({ title: taskTitle }),
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error HTTP: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.status === 'success') {
                            console.log('Tarea editada:', taskId);
                            loadTasks();
                        } else {
                            console.error('Error al editar tarea:', data.message);
                        }
                    })
                    .catch(error => console.error('Error al editar tarea:', error));
            }
        }
    });
});
