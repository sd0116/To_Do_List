document.addEventListener('DOMContentLoaded', function () {
    loadTasks();

    // Función para cargar las tareas
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
            });
    }

    // Manejar formulario para agregar tareas
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
                .catch(error => console.error('Error al agregar la tarea:', error));
        } else {
            saveTaskLocally(task);
            alert('Tarea guardada localmente. Se sincronizará cuando haya conexión.');
        }
    });

    // Guardar tareas localmente
    function saveTaskLocally(task) {
        const offlineTasks = JSON.parse(localStorage.getItem('offlineTasks')) || [];
        offlineTasks.push(task);
        localStorage.setItem('offlineTasks', JSON.stringify(offlineTasks));
        console.log('Tarea guardada localmente:', task);
    }

    // Sincronizar tareas al recuperar conexión
    window.addEventListener('online', () => {
        const offlineTasks = JSON.parse(localStorage.getItem('offlineTasks')) || [];
        offlineTasks.forEach(task => {
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
                        console.log('Tarea sincronizada:', task);
                    }
                })
                .catch(error => console.error('Error al sincronizar tarea:', task, error));
        });
        localStorage.removeItem('offlineTasks');
    });
});
