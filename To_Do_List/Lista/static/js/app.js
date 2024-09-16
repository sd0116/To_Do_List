document.addEventListener('DOMContentLoaded', function () {
    loadTasks();  // Asegúrate de que solo se llame una vez al cargar la página

    // Función para cargar las tareas al iniciar la página
    function loadTasks() {
        fetch('/tasks/')
            .then(response => response.json())
            .then(tasks => {
                const taskList = document.getElementById('task-list');
                taskList.innerHTML = '';  // Limpia la lista antes de cargar las tareas

                tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${task.title}</span>
                        <button onclick="editTask(${task.id}, '${task.title}')">Editar</button>
                        <button onclick="deleteTask(${task.id})">Borrar</button>
                    `;
                    taskList.appendChild(li);
                });
            });
    }

    // Función para añadir una nueva tarea
    document.getElementById('task-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const task = document.getElementById('task').value;

        fetch('/add-task/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'task': task
            })
        }).then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    loadTasks();  // Recargar la lista de tareas después de agregar
                    document.getElementById('task').value = '';  // Limpiar el campo de entrada
                }
            });
    });

            // Función para eliminar una tarea
            window.deleteTask = function (id) {
                fetch(`/delete-task/${id}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                    }
                }).then(() => {
                    loadTasks(); // Recargar la lista de tareas después de eliminar
                });
            };

            window.editTask = function (id, currentTitle) {
                const newTitle = prompt('Edit Task', currentTitle);
                if (newTitle) {
                    fetch(`/update-task/${id}/`, {
                        method: 'PUT',
                        headers: {
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({
                            'title': newTitle
                        })
                    }).then(() => {
                        loadTasks(); // Recargar la lista de tareas después de actualizar
                    });
                }
            };

        });


