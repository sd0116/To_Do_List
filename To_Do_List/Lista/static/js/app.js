document.addEventListener('DOMContentLoaded', function () {
    loadTasks();

    // Función para cargar las tareas al iniciar la página
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
                        <button onclick="editTask(${task.id}, '${task.title}')">Editar</button>
                        <button onclick="deleteTask(${task.id})">Eliminar</button>
                    `;
                    taskList.appendChild(li);
                });

                // Configurar el evento para mostrar/ocultar el botón de papelera general
                setupCheckboxListeners();
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
                    loadTasks(); // Recargar la lista de tareas después de agregar
                    document.getElementById('task').value = ''; // Limpiar el campo de entrada
                }
            });
    });

    // Función para eliminar una tarea individual
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

    // Función para editar una tarea
    window.editTask = function (id, currentTitle) {
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
                loadTasks(); // Recargar la lista de tareas después de actualizar
            });
        }
    };

    // Función para buscar tareas
    window.searchTasks = function () {
        const searchValue = document.getElementById('search-bar').value.toLowerCase();
        const tasks = document.querySelectorAll('#task-list li');

        tasks.forEach(task => {
            const taskText = task.querySelector('.task-title').innerText.toLowerCase();
            if (taskText.includes(searchValue)) {
                task.style.display = 'flex';
            } else {
                task.style.display = 'none';
            }
        });
    };

    // Configurar los eventos de los checkboxes
    function setupCheckboxListeners() {
        const checkboxes = document.querySelectorAll('.task-checkbox');
        const deleteSelectedButton = document.getElementById('delete-selected');

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const selectedTasks = document.querySelectorAll('.task-checkbox:checked');
                deleteSelectedButton.style.display = selectedTasks.length > 0 ? 'block' : 'none';
            });
        });
    }

    // Función para eliminar tareas seleccionadas
    document.getElementById('delete-selected').addEventListener('click', function () {
        const selectedTasks = Array.from(document.querySelectorAll('.task-checkbox:checked')).map(cb => cb.dataset.id);

        if (selectedTasks.length > 0) {
            fetch('/delete-tasks/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ task_ids: selectedTasks })
            }).then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        loadTasks(); // Recargar las tareas después de eliminar
                        document.getElementById('delete-selected').style.display = 'none'; // Ocultar el botón
                    }
                });
        }
    });
});
