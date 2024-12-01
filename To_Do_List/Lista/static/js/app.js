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
            // Intentar enviar la tarea al servidor
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
            // Guardar la tarea localmente
            saveTaskLocally(task);
            alert('Tarea guardada localmente. Se sincronizará cuando estés online.');
        }
    });

    // Guardar tareas localmente
    function saveTaskLocally(task) {
        const offlineTasks = JSON.parse(localStorage.getItem('offlineTasks')) || [];
        offlineTasks.push(task); // Agregar la tarea al array local
        localStorage.setItem('offlineTasks', JSON.stringify(offlineTasks)); // Guardar en localStorage
        console.log(`Tarea guardada localmente: ${task}`);
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
