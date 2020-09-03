<script>
    import 'bulma/css/bulma.css';
    import marked from 'marked';
    import moment from 'moment';
    import {createEventDispatcher, onMount} from 'svelte';
    import {v4 as uuidv4} from 'uuid';
    import NoteView from './NoteView.svelte';

    // Properties.
    export let identifier = null;
    export let mode       = "view"
    export let note       = null;

    // Component data settings.
    let fieldValue = "";
    let markup     = "";
    let uniqueId   = uuidv4();
    const dispatch = createEventDispatcher();

    // Subscriptions.

    /**
     * This function switches the mode to edit, causing the editor form of the
     * Editable content to be shown.
     */
    function activateEditor() {
        console.log("Activate editor called for editor id", uniqueId);
        fieldValue = note.markdown;
        mode       = "edit";
        selectField();
    }

    /**
     * This function cancels edit mode, discarding any changes made while it
     * was operating.
     */
    function cancelEdit() {
        mode = "view";
    }

    /**
     * This function switches the mode to view, causing the editor form of the
     * Editable content to be shown.
     */
    function saveEdits() {
        let event = {action: "task:note:update",
                     data:   {identifier: identifier, markdown: fieldValue},
                     source: "NoteWidget"};

        console.log("Saving edits for note editor id", uniqueId + ".");
        dispatch("action", event);
    }

    /**
     * This function switches the mode to view, causing the editor form of the
     * Editable content to be shown.
     */
    function saveEditsAndClose() {
        saveEdits();
        cancelEdit();
    }

    /**
     * Places editor focus on the note textarea after a very short delay.
     */
    function selectField() {
        setTimeout(() => {
                       document.getElementsByClassName("editor-" + uniqueId).item(0).focus()
                   },
                   100);
    }

    onMount(async () => {
        console.log("Processing the onMount event for an Editable component.");
        if(note.markdown && note.markdown !== "") {
            markup = marked(note.markdown);
        }
        if(mode === "edit") {
            selectField();
        }
    });
</script>

<section>
    <div class="container">
    {#if mode === "view"}
        <div on:click={activateEditor} class="note-view-container" title="Click To Edit">
            <NoteView note={note} />
        </div>
        <!--<div class="{mode === 'view' ? '' : 'is-hidden'}" on:click={activateEditor}>{@html markup}</div>-->
    {:else}
        <div class="field">
            <label class="label" for="note_content">Note</label>
            <div class="control">
                <textarea class="textarea editor-{uniqueId}" name="note_content" bind:value={fieldValue}></textarea>
            </div>
        </div>
        <div>
            <div class="field is-grouped">
                <div class="are-small buttons control">
                    <button class="button is-primary" on:click={saveEditsAndClose}>Save</button>
                    <button class="button is-danger" on:click={cancelEdit}>Cancel</button>
                </div>
            </div>
        </div>
    {/if}
    </div>
    <hr class="component-separator">
</section>

<style>
    .component-separator {
        clear: both;
    }

    .note-view-container {
        cursor: text;
    }
</style>