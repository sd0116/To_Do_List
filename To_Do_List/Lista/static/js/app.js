document.addEventListener('DOMContentLoaded', function () {
    // Función para cargar tareas
    loadTasks();

    function loadTasks() {
        fetch('/tasks/')
            .then(response => response.json())
            .then(tasks => {
                const taskList = document.getElementById('task-list');
                taskList.innerHTML = ''; // Limpia la lista antes de cargar

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

                // Configura los eventos dinámicos para los botones
                setupDynamicListeners();
            });
    }

    // Configura los eventos dinámicos
    function setupDynamicListeners() {
        // Listener para botones de editar tarea
        document.querySelectorAll('.edit-task').forEach(button => {
            button.addEventListener('click', function () {
                const id = this.dataset.id;
                const title = this.dataset.title;
                editTask(id, title);
            });
        });

        // Listener para botones de eliminar tarea
        document.querySelectorAll('.delete-task').forEach(button => {
            button.addEventListener('click', function () {
                const id = this.dataset.id;
                deleteTask(id);
            });
        });
    }

    // Función para editar una tarea
    function editTask(id, currentTitle) {
        const newTitle = prompt('Edita la tarea:', currentTitle);
        if (newTitle && newTitle.trim() !== "") {
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
                loadTasks();
            });
        }
    }

    // Función para eliminar una tarea
    function deleteTask(id) {
        fetch(`/delete-task/${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        }).then(() => {
            loadTasks();
        });
    }

    // Configura el evento del formulario para agregar una nueva tarea
    const form = document.getElementById('task-form');

    // Elimina cualquier listener previo
    form.removeEventListener('submit', handleFormSubmit);

    // Añade el listener de forma única
    form.addEventListener('submit', handleFormSubmit);

    function handleFormSubmit(e) {
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
                    loadTasks(); // Recargar la lista de tareas después de agregar
                    document.getElementById('task').value = ''; // Limpiar el campo de entrada
                }
            });
    }
});
