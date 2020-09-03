<script>
    import 'bulma/css/bulma.css';

    // Stores.

    // Properties.
    export let markup = "";

    // Component data settings.

</script>

<div class="markup-container">{@html markup}</div>

<style>
    :global(.markup-container a) {
        font-weight: bold;
    }

    :global(.markup-container h1) {
        font-size: 1.4em;
        font-weight: bold;
    }

    :global(.markup-container h2) {
        font-size: 1.3em;
        font-weight: bold;
    }

    :global(.markup-container h3) {
        font-size: 1.2em;
        font-weight: bold;
    }

    :global(.markup-container h4) {
        font-size: 1.1em;
        font-weight: bold;
    }

    :global(.markup-container h5) {
        font-weight: bold;
    }

    :global(.markup-container p) {
        margin: 3px 0;
    }
</style>