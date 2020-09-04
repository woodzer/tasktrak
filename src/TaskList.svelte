<script>
    import 'bulma/css/bulma.css';
    import moment from 'moment';
    import {records} from './records.js';
    import {selectedTask, state} from './state.js';
    import {createEventDispatcher, tick} from 'svelte';
    import {get} from 'svelte/store';
    import {anyTaskActiveOn, filterTasksByActiveDates, taskSorter} from './tasks.js';
    import {selectView} from './views.js';

    // Properties.
    export let date        = $state.selectedDate;
    export let selectedIds = [];
    const dispatch         = createEventDispatcher();

    // Component data settings.
    let allSelected        = false;

    // Subscriptions.

    /**
     * This function is used to handle clicks on action icons in the task list.
     */
    function onActionIconClicked(event) {
        console.log("onActionIconClicked() invoked.");
        let actionName = event.target.getAttribute("action");
        let taskId     = event.target.getAttribute("task-id");
        let action      = {action: "task:" + actionName,
                          source: "TaskList"};

        console.log("Dispatching a", actionName, "request for task id", taskId + ".");
        if(actionName === "edit") {
            let task = get(records).tasks.find(e => e.id === taskId);

            if(task) {
                action.data = task;
                selectedTask.set(task);
                tick().then(() =>  dispatch("action", action));
            } else {
                console.error("Failed to locate a task for task id", taskId, "in response to", actionName, "reqeust.");
            }
        } else {
            action.data = [taskId];
            dispatch("action", action);
        }
    }

    /**
     * Event handler that removes a class from a list row when the mouse moves
     * off the row.
     */
     function onMouseEnter(event) {
        let node = event.target;

        while(node && node.nodeName !== "TR") {
            node = node.parentNode;
        }
        if(node) {
            node.classList.remove("unhovered");
        }
    }

    /**
     * Event handler that adds a class from a list row when the mouse moves
     * off the row.
     */
    function onMouseLeave(event) {
        let node = event.target;

        while(node && node.nodeName !== "TR") {
            node = node.parentNode;
        }
        if(node) {
            node.classList.add("unhovered");
        }
    }

    /**
     * Event handler that deals with a click on a particular row in the task
     * list.
     */
    function onRowClicked(event) {
        let taskId = event.target.getAttribute("task-id");
        let task   = get(records).tasks.find(e => e.id === taskId);

        console.log("Task list row clicked on. Task id:", taskId);
        if(task) {
            selectedTask.set(task);
            tick().then(() =>  selectView("reviewTaskView"));
        } else {
            console.error("Failed to locate a task for task id", taskId, "in response to row click.");
        }
}

    /**
     * Event handler that deals with the checkbox that appears in the left hand
     * column of the header row.
     */
    function selectAllClicked(event) {
        console.log("Select all checkbox was clicked has been switched", (event.target.checked ? "on" : "off."));
        if(event.target.checked) {
            let elements = document.getElementsByClassName("task-selector-checkbox");

            for(var i = 0; i < elements.length; i++) {
                let element = elements.item(i);
                let taskId  = element.getAttribute("task-id");

                if(selectedIds.indexOf(taskId) === -1) {
                    selectedIds.push(taskId);
                }
            }
            allSelected = true;
        } else {
            selectedIds = [];
            allSelected = false;
        }
        console.log("Select ids now has", selectedIds.length, "entries.");
        notifySelectionChange(selectedIds);
    }

    /**
     * Event handle used for the checkbox that appears at the start of every row
     * in the task list.
     */
    function selectTaskClicked(event) {
        let taskId = event.target.getAttribute("task-id");

        console.log("Checkbox for task id", taskId, "changed.");
        if(event.target.checked) {
            if(selectedIds.indexOf(taskId) === -1) {
                selectedIds.push(taskId)
                console.log(taskId, "added to the list of selected id which now has", selectedIds.length, "entries.");
            }
        } else {
            if(selectedIds.indexOf(taskId) !== -1) {
                selectedIds = selectedIds.filter(e => e !== taskId);
                console.log(taskId, "removed to the list of selected id which now has", selectedIds.length, "entries.");
            }
        }
        allSelected = (filterTasksByActiveDates($records.tasks, date).length === selectedIds.length);
        notifySelectionChange(selectedIds);
    }

    /**
     * This function dispatches a notification of a change to the task ids
     * that are currently selected.
     */
    function notifySelectionChange(taskIds) {
        let notification = {action: "selection:change",
                            data:   taskIds,
                            source: "TaskList"};

        console.log("Dispatching notification of selection change.");
        dispatch("notify", notification);
    }
</script>

<section>
    <div class="container">
        {#if anyTaskActiveOn($records.tasks, date)}
        <table class="table is-fullwidth is-hoverable">
            <thead>
                <tr>
                    <th>
                        <label class="checkbox" title="Select All Tasks">
                            <input type="checkbox" bind:checked={allSelected} class="select-all-tasks-checkbox task-selection-checkbox" on:change={selectAllClicked}>
                        </label>
                    </th>
                    <th class="title-column">Task</th>
                    <th></th>
                </tr>
            </thead>
            <tbody class="is-size-5">
                {#each filterTasksByActiveDates($records.tasks, date).sort(taskSorter) as task}
                <tr class="unhovered" on:mouseover={onMouseEnter} on:mouseleave={onMouseLeave}>
                    <td class="select-column">
                        <label class="checkbox" title="Select Task">
                            <input type="checkbox" on:change={selectTaskClicked} class="task-selector-checkbox task-selection-checkbox" task-id={task.id} checked={selectedIds.indexOf(task.id) !== -1}>
                        </label>
                    </td>
                    <td on:click={onRowClicked} class="title-column" task-id={task.id}>
                    {#if task.status === "complete"}
                        <s>{task.title}</s>
                    {:else}
                        {task.title}
                    {/if}
                    </td>
                    <td class="control-column">
                        <i on:click={onActionIconClicked} class="far fa-pencil has-text-link-dark icon-control" title="Edit Task" action="edit" task-id={task.id}></i>
                    {#if task.status === "incomplete"}
                        <i on:click={onActionIconClicked} class="fas fa-check-circle has-text-success-dark icon-control" title="Complete Task" action="complete" task-id={task.id}></i>
                    {:else}
                        <i on:click={onActionIconClicked} class="far fa-door-open has-text-link-dark icon-control" title="Re-open Task" action="incomplete" task-id={task.id}></i>
                    {/if}
                        <i on:click={onActionIconClicked} class="far fa-trash-alt has-text-danger-dark icon-control" title="Delete Task" action="delete" task-id={task.id}></i>
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
        {:else}
        <div>
            <center class="has-grey-text">No tasks found for {date.format("YYYY-MM-DD")}.</center>
        </div>
        {/if}
    </div>
</section>

<style>
    .icon-control {
        cursor: pointer;
        margin-right: 10px;
    }

    .title-column {
        cursor: pointer;
        width: 85%;
    }

    tr.unhovered > td > i {
        visibility: hidden;
    }
</style>