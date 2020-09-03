<script>
    import 'bulma/css/bulma.css';
    import {createTaskInstance} from './records.js';
    import TaskForm from './EditTaskForm.svelte';

    // Stores.

    // Properties.
    export let task = createTaskInstance();

    // Component data settings.

</script>

<section>
    <div class="container">
        <TaskForm task={task} on:action />
    </div>
</section>

<style>
</style>