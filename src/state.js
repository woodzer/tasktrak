import moment from 'moment';
import {createTaskInstance} from './records.js';
import {writable} from 'svelte/store';

let currentDate = moment().startOf("day");

/**
 * The selected task will be the target for displaying on the edit form.
 */
export const selectedTask = writable(createTaskInstance());

/**
 * A list of task ids selected on the UI, primarily for use with the day
 * view interface.
 */
export const selectedTaskIds = writable([]);

/**
 * This store is used to trigger the clearance of selections in subcomponents.
 * Note that selection here is just the on screen representation of a selection
 * and not the associated data. Not a fantastic solution but it will suffice.
 */
export const clearSelections = writable(false);

/**
 * This function creates a copy of the state store which contains elements
 * of global application state.
 */
function createState() {
    const {subscribe, set, update} = writable({currentDate:  moment().startOf("day"),
                                               selectedDate: moment().startOf("day")});
    let instance = {/**
                     * This function checks whether the current date has changed
                     * and, if it has, updates the state to reflect this.
                     */
                    assessCurrent: function() {
                        let changed = false;
                        if(currentDate.isBefore(moment().startOf("day"), "day")) {
                            update(s => {
                                s.currentDate = currentDate = moment().startOf("day");
                                console.log("Current date updated to", s.currentDate.format("dddd, Do MMM, YYYY") + ".");
                                return(s);
                            });
                            changed = true;
                        }
                        return(changed);
                    },

                    /**
                     * This function sets the selected date to a specified date.
                     * This function will throw an exception if an attempt is
                     * made to select a date beyond the currently permitted
                     * latest date.
                     */
                    select: function(selection) {
                        this.validateDate(selection);
                        update(s => {
                            console.log("Setting selected date to", selection.format("dddd, Do MMM, YYYY") + ".");
                            s.selectedDate = selection.startOf("day");
                            console.log("Current Date: ", s.currentDate.format("DD-MMM-YYYY HH:mm:ss.SSS"));
                            console.log("Selected Date:", s.selectedDate.format("DD-MMM-YYYY HH:mm:ss.SSS"));
                            return(s);
                        });
                    },
                    /**
                    * This function sets the selected date to the current local
                    * date.
                    */
                    selectToday: function() {
                        this.select(moment().startOf("day"));
                    },
                    /**
                     * Required to make this a valid store object.
                     */
                    subscribe,
                    /**
                     * This function is used to test whether a given is lies on
                     * or before the latest acceptable date. If this is not the
                     * case then an exception is thrown.
                     * 
                     * @param {*} date 
                     */
                    validateDate: function(date) {
                        if(!date.isSameOrBefore(moment(), "day")) {
                            throw("Invalid date selection requested.");
                        }
                    }};

    return(instance);
}

/**
 * Export of the state store for application use.
 */
export const state = createState();
