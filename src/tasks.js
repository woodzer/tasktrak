import localForage from 'localforage';
import moment from 'moment';
import {createTaskInstance, records} from './records.js';
import {state} from './state.js';
import {revertView} from './views.js';

/**
 * This value is used to store the name of the view that preceded the
 * currently selected view.
 */
let previousView = null;

/**
 * This function handles the creation of a task, filling out missing fields
 * and writing the tasks new details to local store.
 */
export function createTask(task, revert) {
    console.log("Received a task create request, processing.");
    records.add(task);
}

/**
 * This function marks all tasks with a specified task id as complete.
 */
export function completeTasks(taskIds) {
    console.log("Complete tasks requested for the following task ids -", taskIds.join(", "));
    records.completeAllOf(taskIds);
}

export function deleteTasks(taskIds) {
    console.log("Delete requested for the following task ids -", taskIds.join(", "));
    if(taskIds.length > 0) {
        records.removeAllOf(taskIds);
    }
}

/**
 * This function filters a task list for tasks that have active dates that
 * match a specific date.
 */
export function filterTasks(tasks, dates) {
    console.log("Calling filter tasks.");

    if(Array.isArray(dates)) {
        let timestamps = dates.map(e => e.startOf("day").unix()).sort();
        return(tasks.filter(entry => {
            return(entry.datesActive.filter(e => timestamps.includes(e)).length > 0);
        }));
    } else {
        let timestamp = dates.startOf("day").unix();
        return(tasks.filter(entry =>  entry.datesActive.indexOf(timestamp) !== -1));
    }
}

/**
 * This function marks all tasks with a specified task id as incomplete.
 */
export function incompleteTasks(taskIds) {
    console.log("Complete tasks requested for the following task ids -", taskIds.join(", "));
    records.incompleteAllOf(taskIds);
}

/**
 * This function can be used with the Array.sort function to sort tasks, placing
 * incomplete tasks above completed ones and otherwise sorting by the task title.
 */
export function taskSorter(task1, task2) {
    if(task1.status === task2.status) {
        if(task1.title < task2.title) {
            return(-1);
        } else if(task1.title > task2.title) {
            return(1);
        } else {
            return(0);
        }
    } else if(task1.status === "incomplete") {
        return(-1);
    } else {
        return(1);
    }
}

/**
 * This function marks all tasks with a specified task id as having been active
 * on the current date. Note, touching a task with this function will not mark
 * it as incomplete.
 */
export function touchTasks(taskIds) {
    console.log("Touching tasks requested for the following task ids -", taskIds.join(", "));
    records.touchAllOf(taskIds, false);
}

/**
 * This function handles updating an existing task record, filling out additional
 * fields and recording the update to local store.
 */
export function updateTask(task, revert) {
    console.log("Received a task update request, processing.");
    if(task.id) {
        records.update(task);
        if(revert) {
            revertView();
        }
    } else {
        console.error("The task passed for a task update request did not possess an id.");
    }
}