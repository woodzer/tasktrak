<script>
	import 'bulma/css/bulma.css';
	import localForage from 'localforage';
	import moment from 'moment';
	import {handleAction} from './actions.js';
	import {createTaskInstance, records} from './records.js';
	import {selectedTask, state} from './state.js';
	import {onMount} from 'svelte';
	import {activeView} from './views.js';
	import {tick} from 'svelte';
	import DayView from './DayView.svelte';
	import EditTaskView from './EditTaskView.svelte';
	import StandUpView from './StandUpView.svelte';
	import TaskReviewView from './TaskReviewView.svelte';
	import WeekView from './WeekView.svelte';


	// Properties.

	// Component data settings.
	let previousView = null;
	let task         = createTaskInstance();

	/**
	 * This function is used to regular check whether the date has changed and
	 * trigger appropriate changes in the application when it does.
	 */
	function checkDate() {
		console.log("Checking for a date change.");
		if(state.assessCurrent()) {
			console.log("Current system date has changed, triggering application update.");
			records.touchStickyTasks();
		}
	}

	/**
	 * The onMount() handler for the application component.
	 */
	onMount(() => {
		let onLoad    = function(data) {
							console.log("Successfully loaded record data from local store.");
							if(data) {
								records.bulkAssign(data);
								tick().then(() => {
									// Bring forward and watch sticky tasks.
									records.touchStickyTasks();
									setInterval(checkDate, 60000);
								});
							} else {
								console.log("Record data was null, assuming a clean start.");
							}
						};
		let onError   = function(cause) {
							console.error("Failed to load record data from local store. Cause:", cause);
						};

		console.log("onMount event handler called.");

		// Load the locally stored data. Note this is an asynchronous operation.
		localForage.config({description: "Local storage for the TaskTrak application.",
							name:        "tasktrak",
							storeName:   "tasktrak_db",
							version:     1.0});
		localForage.getItem("records").then(onLoad).catch(onError);

		console.log("onMount event handler complete.");
	});
</script>

<section>
	<div class="container">
		<nav class="navbar" role="navigation" aria-label="application navigation">
			<div class="navbar-brand">
				<a class="navbar-item" href="/">
					<span class="is-size-3">
						<i class="fas fa-tasks"></i> TaskTrak
					</span>
				</a>

				<!--<a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
					<span aria-hidden="true"></span>
					<span aria-hidden="true"></span>
					<span aria-hidden="true"></span>
				</a>-->
			</div>
		</nav>

	{#if $activeView === "day"}
		<DayView date={$state.selectedDate} on:action={handleAction} />
	{:else if $activeView === "editTask"}
		<EditTaskView on:action={handleAction} task={$selectedTask} />
	{:else if $activeView === "reviewTaskView"}
		<TaskReviewView task={$selectedTask} />
	{:else if $activeView === "standUpView"}
		<StandUpView />
	{:else if $activeView === "weekView"}
		<WeekView weekDate={$state.selectedDate} />
	{:else}
		<center>No view selected????</center>
	{/if}
	</div>
</section>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>