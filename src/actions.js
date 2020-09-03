import {completeTasks, createTask, deleteTasks, incompleteTasks, touchTasks, updateTask} from './tasks.js';
import {updateTaskNote} from './task_notes.js';
import {selectedTask } from './state.js';
import {selectView} from './views.js';
import {tick} from 'svelte';

/**
 * This function provides an application wide event handler that can be used
 * to handle custom events triggered from within the application. Generally
 * this will be placed on the top level component and events allowed to
 * 'bubble' up for handling.
 */
export function handleAction(action) {
    let data = action.detail;

    console.log("Processing a", data.action, "action from the", data.source, "action.");
    if(data.action) {
        let parts = data.action.split(":");

        switch(parts[0]) {
            case 'task':
            case 'tasks':
                if(parts[1] === "note") {
                    handleTaskNoteAction(data);
                } else {
                    handleTaskAction(data);
                }
                break;

            default:
                console.log("Unrecognised action", data.action, "received. Details:", data);
        }
    } else {
        console.error("Recieved an event with no action specifier. Details:", data);
    }
}

/**
 * This function is used to parse and execute task related actions.
 */
export function handleTaskAction(action) {
    console.log("Processing a", action.action, "action from the", action.source, "source as a task action.");
    switch(action.action) {
        case "task:create":
            createTask(action.data, action.revertView);
            break;

        case "task:complete":
        case "tasks:complete":
            completeTasks(action.data);
            break;
    
        case "task:delete":
        case "tasks:delete":
            deleteTasks(action.data);
            break;

        case "task:edit":
            selectedTask.set(action.data);
            tick().then(() => selectView("editTask"));
            break;

        case "task:incomplete":
        case "tasks:incomplete":
            incompleteTasks(action.data);
            break;

        case "task:touch":
        case "tasks:touch":
            touchTasks(action.data);
            break;
    
        case "task:update":
        case "tasks:update":
            updateTask(action.data, action.revertView);
            break;

        default:
            console.error("Unrecognised task action", action.action, "received. Details:", action);
    }
}

/**
 * This function is used to parse and execute task note related actions.
 */
export function handleTaskNoteAction(action) {
    console.log("Processing a", action.action, "action from the", action.source, "source as a task note action.");
    switch(action.action) {
        case "task:note:update":
            updateTaskNote(action.data);
            break;

        default:
            console.error("Unrecognised task note action", action.action, "received. Details:", action);
    }
}