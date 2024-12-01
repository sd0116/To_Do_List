document.addEventListener('DOMContentLoaded', function () {
    loadTasks();

    // Función para cargar tareas
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

    // Manejar el envío del formulario
    document.getElementById('task-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const task = document.getElementById('task').value;

        if (navigator.onLine) {
            // Enviar la tarea al servidor
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
                        loadTasks(); // Recargar tareas
                        document.getElementById('task').value = ''; // Limpiar el campo
                    }
                })
                .catch(error => console.error('Error al enviar la tarea:', error));
        } else {
            alert('Estás offline. Las tareas se guardarán para sincronización.');
        }
    });

    // Registrar el evento de sincronización
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
            window.addEventListener('online', () => {
                console.log('El dispositivo está online. Intentando sincronizar tareas...');
                registration.sync.register('sync-tasks');
            });
        });
    }
});
