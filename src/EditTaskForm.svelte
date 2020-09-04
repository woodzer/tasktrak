<script>
    import 'bulma/css/bulma.css';
    import moment from 'moment';
    import {createTaskInstance, createTaskNote} from './records.js';
    import {selectedTask, state} from './state.js';
    import {revertView} from './views.js';
    import NoteWidget from './NoteWidget.svelte';
    import {createEventDispatcher, onMount, tick} from 'svelte';

    // Properties.
    export let task = createTaskInstance();

    // Component data settings.
    let addNoteDisabled = null;
    let editOffset      = -1;
    let mode            = "standard";
    let noteContent     = "";
    let noteOffset      = -1;
    const dispatch      = createEventDispatcher();

    // Subscriptions.

    /**
     * This function responds to clicks on the add note button.
     */
    function addNoteClicked() {
        noteContent = "";
        mode        = "edit_note";
        setTimeout(() => {
            document.getElementsByClassName("new-note-field").item(0).focus();
        }, 200);
    }

    function onCancelTaskClicked() {
        selectedTask.set(createTaskInstance());
        tick().then(() => revertView());
    }

    function onCancelNoteClicked() {
        mode        = "standard";
        noteContent = "";
    }

    function onSaveNoteClicked() {
        selectedTask.update(task => {
            let note = createTaskNote();

            note.markdown = noteContent;
            task.notes.push(note);
            tick().then(() => {
                mode          = "standard";
                noteContent   = "";
            });
            return(task);
        });
    }

    /**
     * This function gets called in response to the Create/Update button getting
     * pressed.
     */
    function onSaveTaskClicked() {
        let event = {action:     (task.id ? "task:update" : "task:create"),
                     data:       task,
                     revertView: true,
                     source:     "EditTaskForm"};
        console.log("Dispatching a", event.action, "event.");
        dispatch("action", event);
    }

    onMount(() => {
        console.log("Editing: ", task);
        setTimeout(() => {
            document.querySelectorAll("input[name=task_title]")[0].focus();
        }, 200);
    });
</script>

<section>
    <div class="container">
        <h1 class="has-text-weight-bold is-size-4">{task.id ? "Edit" : "New"} Task</h1>
        <hr>
        <form class="form">
            <div class="field">
                <label class="label" for="task_title">Title</label>
                <div class="control">
                    <input class="input" type="text" name="task_title" bind:value={task.title} placeholder="Enter task title">
                </div>
            </div>

            <div class="field">
                <label class="label" for="task_description">Description</label>
                <div clas="control">
                    <textarea class="textarea" name="task_description" bind:value={task.description} placeholder="Enter task description."></textarea>
                </div>
            </div>

            <div class="field">
                <label class="checkbox" for="task_sticky">
                    <input type="checkbox" name="task_sticky" bind:checked={task.sticky}>
                    Sticky
                </label>
            </div>

            <h2 class="has-text-weight-bold is-size-5">Notes</h2>
            <hr>

        {#if task.notes.length === 0 && noteOffset < 0 && mode === "standard"}
            <div class="notes-placeholder">
                <p class="has-text-centered has-text-grey-light">Task does not have any notes.</p>
            </div>
        {:else}
            {#each task.notes as note, index}
            <div>
                <NoteWidget note={note} on:action mode={editOffset === index ? "edit" : "view"} identifier={{noteIndex: index, taskId: task.id}}/>
            </div>
            {/each}
        {/if}

        {#if mode === "edit_note"}
            <div class="field">
                <textarea class="textarea new-note-field" bind:value={noteContent} placeholder="Enter note (markdown format accepted)"></textarea>
            </div>
            <br>
            <div class="field">
                <div class="buttons control">
                    <button class="button is-button is-success is-small" type="button" on:click={onSaveNoteClicked}>
                        <span>Add</span>
                    </button>
                    <button class="button is-button is-danger is-small" type="button" on:click={onCancelNoteClicked}>
                        <span>Discard</span>
                    </button>
                </div>
            </div>
        {:else if mode === "standard"}
            <br>
            <div class="field">
                <div class="buttons control">
                    <button class="button is-button is-success is-small" type="button" on:click={addNoteClicked}>
                        <span class="icon"><i class="fas fa-plus"></i></span>
                        <span>Add Note</span>
                    </button>
                </div>
            </div>
        {/if}

        {#if task.id}
            <br>
            <div class="field">
                <label class="label" for="task_id">Id</label>
                <div class="control">
                    <input class="input" type="text" name="task_id" bind:value={task.id} readonly />
                </div>
            </div>

            <div class="field">
                <label class="label" for="task_status">Status</label>
                <div class="control">
                    <input class="input" type="text" name="task_status" bind:value={task.status} readonly />
                </div>
            </div>
        {/if}

            <br>
            <nav class="navbar">
                <div class="navbar-end">
                    <div class="field is-grouped">
                        <div class="buttons control">
                            <button class="button is-success" on:click={onSaveTaskClicked} type="button">{task.id ? "Update" : "Create"}</button>
                            <button class="button is-danger" on:click={onCancelTaskClicked} type="button">Cancel</button>
                        </div>
                    </div>        
                </div>
            </nav>
        </form>
    </div>
</section>

<style>
</style>