<script>
    import 'bulma/css/bulma.css';
    import moment from 'moment';
    import {records} from './records.js';
    import {revertView} from './views.js';
    import {afterUpdate, onMount, tick} from 'svelte';

    // Properties.
    export let chosenDays   = 10;
    export let tasks        = [];

    // Component data settings.
    let oldestTaskDate     = null;
    let spreadInDays       = 100;
    let totalTasksAffected = 0;
    
    // Subscriptions.

    function oldestDateInDays(list) {
        return(Math.floor(moment.duration(moment().diff(oldestTaskDate)).asDays()));
    }

    function oldestDate(list) {
        let date = null;

        if(list) {
            let unix;

            list.forEach(t => {
                if(date) {
                    if(t.datesActive.length > 0 && t.datesActive[0] < unix) {
                        unix = t.datesActive[0];
                        date = moment.unix(unix);
                    }
                } else {
                    if(t.datesActive.length > 0) {
                        unix = t.datesActive[0];
                        date = moment.unix(unix);
                    }
                }
            });
        }

        if(!date) {
            date = moment().startOf("day");
        }

        console.log("Oldest Date:", date.format("YYYY-MM-DD"));
        return(date);
    }

    function onDoItClicked() {
        let taskIds = outdatedRecords().map(task => task.id);

        console.log("Executing clean up of records completed more than", chosenDays, "ago.");
        if(taskIds.length > 0) {
            records.removeAllOf(taskIds)
        } else {
            console.log("No records to be removed.");
        }
        tick().then(revertView);
    }

    function onMaybeLaterClicked() {
        revertView();
    }

    function outdatedRecords() {
        return(tasks.filter(task => {
            let currentDate = moment();
            let lastActive  = moment.unix(task.datesActive[task.datesActive.length - 1]);
            let age         = Math.floor(moment.duration(moment().diff(lastActive)).asDays());
            return(age > chosenDays && task.status === "complete");
        }));
    }

    function totalOutdated() {
        return(outdatedRecords().length);
    }

    // Lifetime functions.
    afterUpdate(() => {
        console.log("Clean up view after update handler called.");
        oldestTaskDate     = oldestDate(tasks);
        totalTasksAffected = outdatedRecords().length;
        spreadInDays       = Math.floor(moment.duration(moment().diff(oldestTaskDate)).asDays());
        if(chosenDays > spreadInDays || chosenDays < 0) {
            chosenDays = spreadInDays;
        }
    });

    onMount(() => {
        if(chosenDays > spreadInDays || chosenDays === 0 || spreadInDays < 30) {
            chosenDays = spreadInDays;
        } else {
            chosenDays = Math.floor(spreadInDays / 2);
        }
    });
</script>

<section>
    <div class="container">
        <h1 class="has-text-weight-bold is-size-4">Thank You For Using TaskTrak</h1>
        <p>
            You currently have {tasks.length} records, the oldest of which was first
            active {spreadInDays} days ago. TaskTrak is not intended to
            store very large quantities of records and doing so will eventually lead to
            everything running more slowly. To help with system performance you can use the
            options below to delete records that have not been active for a long period of
            time. Note that deleted records will be completely removed and will be unrecoverable.
            Nevertheless, it is recommended that you perform this form to housekeeping on
            a regular basis to keep the application responsive.
        </p>
        <br>
        <div class="field is-grouped">
            <div class="control">
                <label class="label" for="chosen-days">Delete Record That Have Been Inactive For:</label>
                <input bin:max={spreadInDays} min="-1" name="chosen-days" bind:value={chosenDays} type="number">
                <span> Days ({totalTasksAffected} Tasks Will Be Deleted)</span>
            </div>
        </div>
        <br>
        <div class="buttons field is-grouped is-pulled-right">            
            <button class="button is-link" on:click={onMaybeLaterClicked}>Maybe Later</button>
            <button class="button is-danger" on:click={onDoItClicked}>Do It</button>
        </div>
    </div>
</section>

<style>
</style>