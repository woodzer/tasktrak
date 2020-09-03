<script>
    import 'bulma/css/bulma.css';
    import moment from 'moment';
    import {createTaskInstance} from './records.js';
    import {createEventDispatcher} from 'svelte';
    import {writable} from 'svelte/store';

    // Stores.
    const taskTitle = writable("");

    // Properties.

    // Component data settings.
    let title          = "";
    let buttonsEnabled = false;
    const dispatch     = createEventDispatcher();

    /**
     * This function responds to clicks on the create button. 
     */
    function onCreateClicked() {
        let event = {action:     "task:create",
                     data :      createTaskInstance(),
                     revertView: false,
                     source:     "QuickTaskTool"}

        event.data.title = title;
        console.log("Dispatching a create action to create task:", event);
        dispatch("action", event);
        taskTitle.set("");
    }

    // Subscribe to changes to the task title.
    taskTitle.subscribe(v => {
        title          = v;
        buttonsEnabled = (v.trim() !== "");
    });
</script>

<section>
    <div class="container">
        <div class="columns">
            <div class="column is-four-fifths">
                <div class="field">
                    <input class="input" name="title" type="text" placeholder="Enter task title" bind:value={$taskTitle}>
                </div>
            </div>

            <div class="column">
                <div class="field is-grouped">
                    <p class="control">
                        <button class="button is-success" on:click={onCreateClicked} disabled={buttonsEnabled ? null : "disabled"}>Create</button>
                    </p>
                    <p class="control">
                        <button class="button is-link"  disabled>Edit</button>
                    </p>
                </div>
            </div>
        </div>
    </div>
</section>

<style>
</style>