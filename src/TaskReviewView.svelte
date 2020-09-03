<script>
    import 'bulma/css/bulma.css';
    import marked from 'marked';    
    import moment from 'moment';
    import {revertView} from './views.js';
    import MarkupContainer from './MarkupContainer.svelte';

    // Stores.

    // Properties.
    export let task = null;

    // Component data settings.

    /**
     * This function provides an event handler for when the close button is
     * clicked on. 
     */
    function closeButtonClicked() {
        console.log("Closing the review task view.");
        revertView();
    }
</script>

<section>
    <div class="container">
        <div class="table-container">
            {#if task}
            <table class="table is-bordered is-fullwidth">
                <tbody>
                    <tr>
                        <td class="label-column">Title</td>
                        <td>{task.title}</td>
                    </tr>
                    <tr>
                        <td class="label-column">Description</td>
                        <td>
                            <MarkupContainer markup={marked(task.description)} />
                        </td>
                    </tr>
                    <tr>
                        <td class="label-column">Notes</td>
                        <td>
                            {#each task.notes as note, index}
                            <MarkupContainer markup={marked(note.markdown)} />
                            <br>
                            {/each}
                        </td>
                    </tr>
                    <tr>
                        <td class="label-column">Sticky</td>
                        <td>{task.sticky ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                        <td class="label-column">Status</td>
                        <td>
                            <span class="is-capitalized">{task.status}</span>
                            {#if task.completed}
                            <span>{moment(task.completed).format("HH:mm:ss YYYY-MM-DD")}</span>
                            {/if}
                        </td>
                    </tr>
                    <tr>
                        <td class="label-column">Identifier</td>
                        <td>{task.id}</td>
                    </tr>
                    <tr>
                        <td class="label-column">Created</td>
                        <td>{moment.unix(task.createdAt).format("HH:mm:ss YYYY-MM-DD")}</td>
                    </tr>
                    <tr>
                        <td class="label-column">Updated</td>
                        <td>
                        {#if task.updatedAt}
                            {moment.unix(task.updatedAt).format("HH:mm:ss YYYY-MM-DD")}
                        {/if}
                        </td>
                    </tr>
                </tbody>
            </table>
            {/if}
        </div>
        <div class="field is-pulled-right">
            <div class="control">
                <button on:click={closeButtonClicked} class="button is-danger">Close</button>
            </div>
        </div>
    </div>
</section>

<style>
    .label-column {
        font-weight: bold;
        width: 10%;
    }
</style>