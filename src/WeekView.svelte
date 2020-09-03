<script>
    import 'bulma/css/bulma.css';
    import moment from 'moment';
    import {records} from './records.js';
    import {filterTasks, taskSorter} from './tasks.js';
    import {revertView} from './views.js';
    import {get} from 'svelte/store';

    import {onMount} from 'svelte';

    // Stores.
    
    // Properties.
    export let weekDate = moment();

    // Component data settings.
    
    /**
     * This function fetches a collection of objects containing details for
     * the tasks that were active during a week containing the date passed
     * in.
     */
    function activityRecords(date) {
        let activity   = [];
        let timestamps = getDates(date).map(e => moment(e).startOf("day").unix());

        get(records).tasks.forEach(task => {
            let intersection = task.datesActive.filter(e => timestamps.includes(e));

            if(intersection.length > 0) {
                let record = {activeDays: [false, false, false, false, false, false, false],
                              title:      task.title,
                              totalDays:  task.datesActive.length};

                for(var i = 0; i < 7; i++) {
                    if(task.datesActive.includes(timestamps[i])) {
                        record.activeDays[i] = true;
                    }
                }
                activity.push(record);
                record = null;
            }
        });

        return(activity.sort((lhs, rhs) => {
            if(lhs.title < rhs.title) {
                return(-1);
            } else if(lhs.title > rhs.title) {
                return(1);
            } else {
                return(0);
            }
        }));
    }

    /**
     * The stand up view is based on two dates, general today and yesterday. For
     * Mondays however it should be today and the preceding Friday. This function
     * calculates the appropriate dates and returns an array containing them.
     */
    function getDates(date) {
        console.log("Getting the week dates for the week containing", date.format("YYYY-MM-DD."));
        let start = moment(date).startOf("week").startOf("day");
        return([start,
                moment(start).add(1, "day"),
                moment(start).add(2, "days"),
                moment(start).add(3, "days"),
                moment(start).add(4, "days"),
                moment(start).add(5, "days"),
                moment(start).add(6, "days")]);
    }

    /**
     * This function provides the on click event handler for the close button.
     */
    function onCloseClicked() {
        console.log("Closing the week up view.");
        revertView();
    }

    function startDate() {
        let date = moment(weekDate).startOf("week");
        return(date.format("Do MMMM, YYYY"));
    }

    onMount(() => {
        console.log("Selected Date:", weekDate.format("YYYY-MM-DD"));
    });

</script>

<section>
    <div class="container">
        <h2 class="has-text-weight-bold is-size-4">Week Start: {startDate()}</h2>
        <br>
        <div class="table-container">
            <table class="is-bordered is-fullwidth is-striped table">
                <thead>
                    <tr>
                        <th class="name-column">Task</th>
                        <th class="sunday-column"><center>Sun</center></th>
                        <th class="monday-column"><center>Mon</center></th>
                        <th class="tuesday-column"><center>Tue</center></th>
                        <th class="wednesday-column"><center>Wed</center></th>
                        <th class="thursday-column"><center>Thu</center></th>
                        <th class="friday-column"><center>Fri</center></th>
                        <th class="saturday-column"><center>Sat</center></th>
                        <th class="total-column"><center>Total</center></th>
                    </tr>
                </thead>
                <tbody>
                {#each activityRecords(weekDate) as task}
                    <tr>
                        <td>{task.title}</td>
                        <td class="greyed-column">
                            <center>
                            {#if task.activeDays[0]}
                                <span class="icon has-text-success is-size-4"><i class="fas fa-check"></i></span>
                            {/if}
                            </center>
                        </td>
                        <td>
                            <center>
                            {#if task.activeDays[1]}
                                <span class="icon has-text-success is-size-4"><i class="fas fa-check"></i></span>
                            {/if}
                            </center>
                        </td>
                        <td>
                            <center>
                            {#if task.activeDays[2]}
                                <span class="icon has-text-success is-size-4"><i class="fas fa-check"></i></span>
                            {/if}
                            </center>
                        </td>
                        <td>
                            <center>
                            {#if task.activeDays[3]}
                                <span class="icon has-text-success is-size-4"><i class="fas fa-check"></i></span>
                            {/if}
                            </center>
                        </td>
                        <td>
                            <center>
                            {#if task.activeDays[4]}
                                <span class="icon has-text-success is-size-4"><i class="fas fa-check"></i></span>
                            {/if}
                            </center>
                        </td>
                        <td>
                            <center>
                            {#if task.activeDays[5]}
                                <span class="icon has-text-success is-size-4"><i class="fas fa-check"></i></span>
                            {/if}
                            </center>
                        </td>
                        <td class="greyed-column">
                            <center>
                            {#if task.activeDays[6]}
                                <span class="icon has-text-success is-size-4"><i class="fas fa-check"></i></span>
                            {/if}
                            </center>
                        </td>
                        <td>
                            <center>
                                <span class="total">{task.totalDays}</span>
                            </center>
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>

        <div class="field is-pulled-right">
            <div class="control">
                <button class="button is-danger" on:click={onCloseClicked}>Close</button>
            </div>
        </div>
    </div>
</section>

<style>
    .greyed-column {
        background: #f9ecf9;
    }
</style>