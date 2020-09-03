<script>
    import 'bulma/css/bulma.css';
    import {createEventDispatcher, onMount} from 'svelte';
    import {writable} from 'svelte/store';
    import DayViewToolbar from './DayViewToolbar.svelte';
    import TaskList from './TaskList.svelte';

    // Stores.
    
    // Properties.
    export let date = moment();
    const dispatch  = createEventDispatcher();

    // Component data settings.
    let selectedIds   = [];
    let tasksSelected = false;

    function completeSelection() {
        if(selectedIds.length > 0) {
            dispatch("action", {action: "tasks:complete", data: selectedIds, source: "DayView"});
            selectedIds   = [];
            tasksSelected = false;
        }
    }

    function deleteSelection() {
        if(selectedIds.length > 0) {
            dispatch("action", {action: "tasks:delete", data: selectedIds, source: "DayView"});
            selectedIds   = [];
            tasksSelected = false;
        }
    }

    function incompleteSelection() {
        if(selectedIds.length > 0) {
            dispatch("action", {action: "tasks:incomplete", data: selectedIds, source: "DayView"});
            selectedIds   = [];
            tasksSelected = false;
        }
    }

    function touchSelection() {
        if(selectedIds.length > 0) {
            dispatch("action", {action: "tasks:touch", data: selectedIds, source: "DayView"});
            selectedIds   = [];
            tasksSelected = false;
        }
    }

    /**
     * This function handles notifications coming from subcomponents.
     */
    function handleNotifications(event) {
        let notification = event.detail;
        switch(notification.action) {
            case "selection:change":
                console.log("Updating selected id set to:", notification.data.join(", "));
                selectedIds = notification.data;
                tasksSelected = notification.data.length > 0;
                break;

            case "selection:complete":
                console.log("Received a complete selection request from", notification.source + ".");
                completeSelection();
                break;

            case "selection:delete":
                console.log("Received a delete selection request from", notification.source + ".");
                deleteSelection();
                break;

            case "selection:incomplete":
                console.log("Received an incomplete selection request from", notification.source + ".");
                incompleteSelection();
                break;

            case "selection:touch":
                console.log("Received a touch selection request from", notification.source + ".");
                touchSelection();
                break;

            default:
                console.error("Unrecognised notification", notification.action, "received from", notification.source + ".");
        }
    }

    onMount(() => {
        console.log("Day view on mount handler called.");
    });

</script>

<section>
    <div class="container">
        <DayViewToolbar on:action on:notify={handleNotifications} tasksSelected={tasksSelected}/>
        <br>
        <TaskList date={date} selectedIds={selectedIds} on:action on:notify={handleNotifications} />
    </div>
</section>

<style>
</style>