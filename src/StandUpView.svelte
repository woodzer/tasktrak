<script>
    import 'bulma/css/bulma.css';
    import moment from 'moment';
    import {records} from './records.js';
    import {filterTasksByActiveDates, taskSorter} from './tasks.js';
    import {revertView} from './views.js';

    // Stores.
    
    // Properties.

    // Component data settings.
    let dates     = getDates();
    let dayTitles = ["Yesterday", "Today"];

    /**
     * This function returns a string containing two numbers separated by a
     * '/'. The left hand number represents the number of days in a given
     * week (as calculated from the date passed in) that the specified task
     * was active. The right hand number represents the total number of
     * days that the task was active.
     */
    function activityRecord(task, date) {
        let dateRange  = weekDates(date).map(e => e.unix());
        let daysOfWeek = task.datesActive.filter(e => dateRange.includes(e));
        return(daysOfWeek.length + " / " + task.datesActive.length);
    }

    /**
     * The stand up view is based on two dates, general today and yesterday. For
     * Mondays however it should be today and the preceding Friday. This function
     * calculates the appropriate dates and returns an array containing them.
     */
    function getDates() {
        let dates = [moment().subtract(1, "day").startOf("day"), moment().startOf("day")];

        if(dates[0] == moment().startOf("week").startOf("day")) {
            dates[0] = dates[0].subtract(2, "days");
            dayTitles[0] = "Last Friday";
        }
        return(dates);
    }

    /**
     * This function provides the on click event handler for the close button.
     */
    function onCloseClicked() {
        console.log("Closing the stand up view.");
        revertView();
    }

    /**
     * This function returns an array of seven dates for the week that includes
     * the date passed in. Weeks are assumed to start on a Sunday and run to the
     * following Saturday.
     */
    function weekDates(date) {
        let start = moment(date).startOf("week");
        return([start,
                moment(start).add(1, "day"),
                moment(start).add(2, "days"),
                moment(start).add(3, "days"),
                moment(start).add(4, "days"),
                moment(start).add(5, "days"),
                moment(start).add(6, "days")]);
    }

</script>

<section>
    <div class="container">
        <div class="table-container">
            <table class="is-bordered is-fullwidth is-striped table">
                <thead>
                    <tr>
                        <th class="name-column">Task</th>
                        <th class="yesterday-column"><center>Yesterday</center></th>
                        <th class="today-column"><center>Today</center></th>
                    </tr>
                </thead>
                <tbody>
                {#each filterTasksByActiveDates($records.tasks, dates).sort(taskSorter) as task}
                    <tr>
                        <td>{task.title}</td>
                        <td>
                            <center>
                            {#if task.datesActive.includes(dates[0].unix())}
                                <span class="icon has-text-success is-size-4"><i class="fas fa-check"></i></span>
                                <br>
                                {#if !task.datesActive.includes(dates[1].unix())}
                                <span class="day-totals">{activityRecord(task, dates[1])}</span>
                                {/if}
                            {/if}
                            </center>
                        </td>
                        <td>
                            <center>
                            {#if task.datesActive.includes(dates[1].unix())}
                                <span class="icon has-text-success is-size-4"><i class="fas fa-check"></i></span>
                                <br>
                                <span class="day-totals">{activityRecord(task, dates[1])}</span>
                            {/if}
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
    .day-totals {
        font-weight: bold;
    }

    .today-column {
        width: 10%;
    }

    .yesterday-column {
        width: 10%;
    }
</style>