<script>
    import 'bulma/css/bulma.css';
    import marked from 'marked';
    import moment from 'moment';
    import MarkupContainer from './MarkupContainer.svelte';

    // Stores.

    // Properties.
    export let note = null;

    // Component data settings.

</script>

<section>
    <MarkupContainer markup={marked(note.markdown)} />
    <footer>
        <span class="is-size-7 has-text-grey-light">Created: {moment.unix(note.createdAt).format("dddd, Do MMMM, YYYY at HH:mm:ss")}</span>
        {#if note.updatedAt && note.updatedAt !== note.createdAt}
        <span class="is-size-7 has-text-grey-light">, Last Update: {moment.unix(note.updatedAt).format("dddd, Do MMMM, YYYY at HH:mm:ss")}</span>
        {/if}
    </footer>
</section>

<style>
</style>