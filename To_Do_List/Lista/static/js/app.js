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
            // Guardar tarea localmente si está offline
            saveTaskLocally(task);
            alert('Tarea guardada localmente. Se sincronizará cuando estés online.');
        }
    });


    const form = document.getElementById('task-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
    const task = document.getElementById('task').value;

    if (navigator.onLine) {
        enviarTareaAlServidor(task);
    } else {
        saveTaskLocally(task);
        alert('Tarea guardada localmente. Se sincronizará cuando estés online.');
    }
        });
    } else {
        console.error('El formulario con ID "task-form" no se encontró.');
    }
    

    // Guardar tareas localmente
    function saveTaskLocally(task) {
        const offlineTasks = JSON.parse(localStorage.getItem('offlineTasks')) || [];
        offlineTasks.push(task); // Agregar tarea al array local
        localStorage.setItem('offlineTasks', JSON.stringify(offlineTasks)); // Guardar en localStorage
        console.log('Tarea guardada localmente:', task);
    }



    function enviarTareaAlServidor(task) {
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
                console.log('Tarea enviada al servidor:', task);
            }
        })
        .catch(error => console.error('Error al enviar la tarea:', error));
    }
    


    // Sincronizar tareas almacenadas cuando vuelva la conexión

});
