<script>
    import 'bulma/css/bulma.css';
    import moment from 'moment';
    import {createTaskInstance} from './records';
    import {selectView} from './views.js';
    import {clearSelections, selectedTaskIds, state} from './state.js';
    import {createEventDispatcher} from 'svelte';
    import {get} from 'svelte/store';

    // Properties.
    export let tasksSelected = false;
    
    // Component data settings.
    let taskTitle  = "";
    const dispatch = createEventDispatcher();

    function completeSelectedClicked() {
        let notification = {action: "selection:complete",
                            source: "DayViewToolbar"};

        console.log("Dispatching notification of complete selected request.");
        dispatch("notify", notification);
    }

    function deleteSelectedClicked() {
        let notification = {action: "selection:delete",
                            source: "DayViewToolbar"};

        console.log("Dispatching notification of delete selected request.");
        dispatch("notify", notification);
    }

    function incompleteSelectedClicked() {
        let notification = {action: "selection:incomplete",
                            source: "DayViewToolbar"};

        console.log("Dispatching notification of incomplete selected request.");
        dispatch("notify", notification);
    }

    /**
     * A function used to determine whether the current task title setting
     * represents a valid task title.
     */
    function isTaskTitleValid() {
        return(taskTitle.trim() !== "");
    }

    /**
     * This function responds to clicks on the create button. 
     */
     function onCreateClicked() {
        if(isTaskTitleValid()) {
            let event = {action:     "task:create",
                         data:       createTaskInstance(),
                         revertView: false,
                         source:     "DayViewToolbar"}

            event.data.title = taskTitle;
            console.log("Dispatching a create action to create task:", event);
            dispatch("action", event);
            taskTitle = "";
        }
    }

    /**
     * This function responds to clicks on the edit button.
     */
    function onEditClicked(event) {
        if(isTaskTitleValid()) {
            let task  = createTaskInstance();
            let event = {action:     "task:edit",
                         data:       task,
                         source:     "DayViewToolbar"}

            event.data.title = taskTitle;
            console.log("Dispatching an edit task action:", event);
            dispatch("action", event);
            taskTitle = "";
        }
    }

    /**
     * This function changes the current selected date back by one day.
     */
    function stepBack1Day() {
        console.log("Request to step selected date back by one day.");
        clearSelections.set(true);
        state.select($state.selectedDate.subtract(1, "day"));
    }

    /**
     * This function changes the current selected date back by seven days.
     */
    function stepBack1Week() {
        console.log("Request to step selected date back by one week.");
        clearSelections.set(true);
        state.select($state.selectedDate.subtract(1, "week"));
    }

    /**
     * This function changes the current selected date forward by one day.
     */
    function stepForward1Day() {
        let newDate = $state.selectedDate.add(1, "day");

        console.log("Request to step selected date forward by one day.");
        if(newDate.isAfter(moment(), "day")) {
            console.log("Moving the selected date to the current date only.");
            newDate = moment().startOf("day");
        }
        clearSelections.set(true);
        state.select(newDate);
    }

    /**
     * This function changes the current selected date forward by seven days or
     * as far as the current date, which ever is earliest.
     */
    function stepForward1Week() {
        let newDate = $state.selectedDate.add(1, "week"); 
        console.log("Request to step selected date forward by one week.");
        if(newDate.isAfter(moment(), "day")) {
            console.log("Moving the selected date to the current date only.");
            newDate = moment().startOf("day");
        }
        clearSelections.set(true);
        state.select(newDate);
    }

    /**
     * This function switches the current view used by the application.
     */
    function switchView(viewName) {
        console.log("Switch view request for the ", viewName, "view received.");
        if(viewName && viewName !== "") {
            selectView(viewName);
        } else {
            console.error("No view name specified.");
        }
    }

     /**
      * This function dispatches a request to touch all selected task records.
      */
     function touchSelectedClicked() {
        let notification = {action: "selection:touch",
                            source: "DayViewToolbar"};

        console.log("Dispatching notification of touch selected request.");
        dispatch("notify", notification);
    }

    // Subscriptions.
</script>

<section>
    <div class="container">
        <nav class="navbar">
            <div class="navbar-menu">
                <div class="navbar-start">
                    <div class="navbar-item">
                        <div class="field is-grouped">
                            <input class="input" placeholder="Enter task title" name="task_title" bind:value={taskTitle}>
                            <button on:click={onCreateClicked} class="button" title="Add Task To Todays List" disabled={taskTitle.trim() !== "" ? null : "disabled"}>
                                <span class="icon has-text-success-dark"><i class="fas fa-calendar-plus"></i></span>
                            </button>
                            <button on:click={onEditClicked} class="button" title="Edit Task" disabled={taskTitle.trim() !== "" ? null : "disabled"}>
                                <span class="icon has-text-link-dark"><i class="far fa-pencil"></i></span>
                            </button>
                        </div>
                    </div>
                    <div class="navbar-item">
                        <div class="control">
                            <button on:click={deleteSelectedClicked} class="button" title="Delete Selected Tasks" disabled={!tasksSelected}>
                                <span class="icon has-text-danger-dark"><i class="far fa-trash-alt"></i></span>
                            </button>
                        </div>

                        <div class="control">
                            <button on:click={completeSelectedClicked} class="button" title="Complete Selected Tasks" disabled={!tasksSelected}>
                                <span class="icon has-text-success-dark"><i class="fas fa-calendar-check"></i></span>
                            </button>
                        </div>

                        <div class="control">
                            <button on:click={incompleteSelectedClicked} class="button" title="Re-open Selected Tasks" disabled={!tasksSelected}>
                                <span class="icon has-text-link-dark"><i class="far fa-door-open"></i></span>
                            </button>
                        </div>

                        <div class="control">
                            <button on:click={touchSelectedClicked} class="button" title="Add Selected Tasks To Todays List" disabled={!tasksSelected}>
                                <span class="icon has-text-link-dark"><i class="fas fa-arrow-to-right"></i></span>
                            </button>
                        </div>
                    </div>

                    <div class="navbar-item">
                        <div class="control">
                            <button on:click={() => switchView("standUpView")} view-name="standUpView" class="button" title="Stand Up View">
                                <span class="icon"><i class="far fa-user-friends"></i></span>
                            </button>

                            <button on:click={() => switchView("weekView")} view-name="weekView" class="button" title="Week View">
                                <span class="icon"><i class="far fa-calendar-week"></i></span>
                            </button>
                        </div>
                    </div>

                    <div class="navbar-item">
                        <div class="control">
                            <button on:click={() => switchView("cleanUpView")} view-name="cleanUpView" class="button" title="Clean Up">
                                <span class="icon"><i class="far fa-hand-sparkles"></i></span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="navbar-end">
                    <!-- <div class="navbar-item">
                        <span class="has-text-weight-bold is-size-4">{$state.selectedDate.format("dddd, Do MMMM, YYYY")}</span>
                    </div> -->

                    <div class="navbar-item">
                        <div class="control">
                            <div class="buttons">
                                <button class="button is-dark" title="Previous Week" on:click={stepBack1Week}>
                                    <span class="icon">
                                        <i class="fas fa-angle-double-left"></i>
                                    </span>
                                </button>

                                <button class="button is-dark" title="Previous Day" on:click={stepBack1Day}>
                                    <span class="icon">
                                        <i class="fas fa-angle-left"></i>
                                    </span>
                                </button>

                                <button class="button is-dark" title="Next Day" on:click={stepForward1Day}  disabled={($state.selectedDate.isSame(moment(), "day") ? "disabled" : null)}>
                                    <span class="icon">
                                        <i class="fas fa-angle-right"></i>
                                    </span>
                                </button>

                                <button class="button is-dark disabled" title="Next Week" on:click={stepForward1Week} disabled={($state.selectedDate.isSame(moment(), "day") ? "disabled" : null)}>
                                    <span class="icon">
                                        <i class="fas fa-angle-double-right"></i>
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div class="navbar-item">
                            <span class="has-text-weight-bold is-size-5">{$state.selectedDate.format("dddd, Do MMMM, YYYY")}</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </div>
</section>

<style>
    input[name=task_title] {
        min-width: 400px;
    }
</style>