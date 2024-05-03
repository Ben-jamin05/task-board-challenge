// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() { 
    if (nextId === null) {
        nextId = 1;
        return nextId;
    }
    nextId++;
    return nextId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    let cardClass = '';
    let taskDueDate = dayjs(task.taskDueDate);
    let today = dayjs();

    if (taskDueDate.isBefore(today, 'day')) {
        cardClass = 'bg-danger';
    } else if (taskDueDate.isSame(today, 'day') || taskDueDate.isBefore(today.add(3, 'day'))) {
        cardClass = 'bg-warning';
    }
    if (task.status === 'done') {
        cardClass = '';
    }

    let card = `
        <div class="card mb-3 task-card ${cardClass}" id="task-${task.id}">
            <div class="card-body">
                <h5 class="card-title">${task.taskTitle}</h5>
                <p class="card-text">${task.taskDescription}</p>
                <p class="card-text"><small class="text-muted">Due: ${task.taskDueDate}</small></p>
                <button type="button" class="btn btn-danger delete-btn" data-task-id="${task.id}">Delete</button>
            </div>
        </div>
    `; //finding out how to do this might be the best thing to have ever happened to me
    return card;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    $("#todo-cards, #in-progress-cards, #done-cards").empty();
    taskList.forEach(task => {
        let card = createTaskCard(task);
        $(`#${task.status}-cards`).append(card);
    });
    $(".task-card").draggable({
        revert:"invalid",
        cursor: "move",
        zIndex: 1 
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();
    let title = $("#task-title").val();
    let dueDate = $("#task-due-date").val();
    let description = $("#task-description").val();
    let newTask = {
        id:generateTaskId(),
        taskTitle: title,
        taskDueDate: dueDate,
        taskDescription: description,
        status: "todo"
    };
    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", nextId);
    $("#formModal").modal("hide");
    renderTaskList();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    let taskId = $(event.target).data("task-id");
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    let taskId = ui.draggable.attr("id").split("-")[1];
    let newStatus = $(event.target).attr("id");
    taskList.forEach(task => {
        if (task.id == taskId) {
            task.status = newStatus;
        }
    });
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();
    $("#formModal").on("hidden.bs.modal", function () {
        $(this).find("form")[0].reset();
    });
    $(".delete-btn").click(handleDeleteTask);
    $(".lane").droppable({
        accept: ".task-card",
        drop: handleDrop
    });

    $("#task-due-date").datepicker({
        dateFormat: "yy-mm-dd",
    });

    $(".btn-primary").click(handleAddTask);

    $(".modal-header .close").click(function () {
        $("#formModal").modal("hide");
    });
});

$(document).on("click", ".delete-btn", function(event) {
    let taskId = $(event.target).data("task-id");
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
});

//had issues with buttons not working so I added some code that google said would help and it did so im keeping it
//a bit redundant but it fixed my buttons so I dont know 