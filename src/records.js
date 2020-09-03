import moment from 'moment';
import {writable} from 'svelte/store';
import {v4 as uuidv4} from 'uuid';
import localForage from 'localforage';

/**
 * This function creates a custom Svelte writable store that can be interacted
 * with to maintain the list of records for the system.
 */
function createTaskInstanceStore() {
    const {subscribe, set, update} = writable({tasks:   [],
                                               lastSave:   moment()});
    let instance  = {/**
                      * Adds a new record to the list maintained by the store.
                      * @param {*} record  The record to be added.
                      */
                     add: function(record) {
                         console.log("Received a request to add a task record.");
                         if(!record.id) {
                             record.id = uuidv4();
                             console.log("Task had no id, so assigned it an id of", record.id + ".");
                         }

                         if(record.datesActive.length === 0) {
                             console.log("Assigning new record as being active today.");
                             record.datesActive.push(moment().startOf("day").unix());
                         }

                         if(!record.createdAt) {
                             console.log("Task record has no creation date/time, setting it to now.");
                             record.createdAt = moment().unix();
                         }

                         update(records => {
                             console.log("Pushing record id", record.id, "into the list of tasks.");
                             records.tasks.push(record);
                             return(records);
                         });
                         this.save();
                     },
                     /**
                      * This function is used to assign the locally loaded data
                      * after it has been retrieved and should never be otherwise
                      * called unless you know what you are doing.
                      */
                     bulkAssign: (content) => {
                         console.log("Bulk assigning", content.tasks.length, "task records.");
                         update(records => {
                             records.tasks    = content.tasks;
                             records.lastSave = moment.unix(content.lastSave);
                             return(records);
                         });
                     },
                     /**
                      * This function marks a record as complete.
                      * 
                      * @param {*} record  Either the record to be completed or
                      *                    its id value.
                      */
                     complete: function(record) {
                         if(typeof record === "string") {
                             this.completeAllOf([record]);
                         } else {
                             this.completeAllOf([record.id])
                         }
                     },
                     /**
                      * This function marks the records for a given set of
                      * task ids as complete.
                      */
                     completeAllOf: function(taskIds) {
                        if(taskIds.length > 0) {
                               this.updateStatusForAll(taskIds, "complete", false);
                        }
                    },
                    /**
                     * This function marks a record as complete.
                     * 
                     * @param {*} record  Either the record to be completed or
                     *                    its id value.
                     */
                    incomplete: function(record) {
                        if(typeof record === "string") {
                            this.incompleteAllOf([record]);
                        } else {
                            this.incompleteAllOf([record.id])
                        }
                    },
                    /**
                      * This function marks the records for a given set of
                      * task ids as complete.
                      */
                     incompleteAllOf: function(taskIds) {
                        if(taskIds.length > 0) {
                            this.updateStatusForAll(taskIds, "incomplete", true);
                        }
                    },
                    /**
                      * Removes an existing record from the store.
                      * 
                      * @param {*} record  Either the record to be removed or
                      *                    the id for the record.
                      */
                     remove: function(record) {
                         if(typeof record === "string") {
                             console.log("Looking to remove record id", record, "from store.");
                             this.removeUnmatched(e => e.id !== record);
                         } else {
                             if(record.id) {
                                 console.log("Looking to remove record id", record, "from store.");
                                 this.removeUnmatched(e => e.id !== record.id);
                             } else {
                                 console.error("Request made to remove a record that did not have an id.");
                             }
                         }
                     },
                     /**
                      * This function eliminates all records based on a list of
                      * specified ids.
                      */
                     removeAllOf: function(taskIds) {
                        console.log("Delete of the following record ids requested -", taskIds.join(", "));
                        this.removeUnmatched(e => taskIds.indexOf(e.id) === -1);
                     },
                     /**
                      * This function deletes all records matching a given
                      * predicate function. The predicate function should
                      * take a single record parameter and return true if
                      * the record is to be retained or false if the record
                      * is to be deleted.
                      */
                     removeUnmatched: function(predicate) {
                         let changed = 0;

                         update(records => {
                             let total = records.tasks.length;

                             records.tasks = records.tasks.filter(predicate);
                             changed = (total !== records.tasks.length);
                             return(records);
                         })

                         if(changed) {
                             this.save();
                         }
                     },
                     /**
                      * This function saves the details of the store into browser
                      * based storage. Other functions that alter the store will
                      * call this method after they have completed successfully.
                      */
                     save: function() {
                         console.log("Saving records to local storage.");
                         update(records => {
                             let data     = {tasks:    records.tasks,
                                             lastSave: moment().unix()};
                             let onError  = function(cause) {
                                                console.error("Failed to write record to local storage. Cause:", cause);
                                            };
                             let onSuccess = function() {
                                                 console.log("Save of records completed successfully.");
                                             };
                             records.lastSave = moment().unix();
                             console.log("SAVE DATA:", records);
                             localForage.setItem("records", data).then(onSuccess).catch(onError);
                             records.lastSave = moment.unix(data.lastSave);
                             return(records);
                         });
                     },
                     /**
                      * Function necessary to store operation.
                      */
                     subscribe,
                     /**
                      * This function updates a list of tasks to make them after
                      * on the current date. If the tasks are complete they are
                      * also marked as incomplete as part of this process.
                      */
                     touchAllOf: function(taskIds, reactivate) {
                        console.log("Touching the following list of task ids:", taskIds.join(", "));
                        this.touchMatching(e => taskIds.indexOf(e.id) !== -1, reactivate);
                     },
                     /**
                      * This function updates a list of tasks to make them active
                      * on the current date. If the tasks are complete they are
                      * also marked as incomplete as part of this process. The
                      * tasks to be 'touched' are determine using the predicate
                      * function passed in. This predicate should take a record
                      * as a parameter and return true if the record should be
                      * 'touched', or false otherwise.
                      */
                     touchMatching: function(predicate, reactivate) {
                         let changed = false;

                         update(records => {
                             let tasks = records.tasks.filter(predicate);

                             if(tasks.length > 0) {
                                let dateTime = moment().startOf("day").unix();

                                 tasks.forEach(e => {
                                     if(!e.datesActive.find(t => t === dateTime)) {
                                         e.datesActive.push(dateTime);
                                     }
                                     if(reactivate && e.status !== "incomplete") {
                                         e.status = "incomplete";
                                     }
                                     e.updatedAt = moment().unix();
                                  });
                             }

                             changed = tasks.length > 0;
                             return(records);
                         });

                         if(changed) {
                             this.save();
                         }
                     },
                     /**
                      * This function updates incomplete sticky items to include todays
                      * date as an active day.
                      */
                     touchStickyTasks: function() {
                         console.log("Touching sticky incomplete tasks for current date.");
                         this.touchMatching(e => {
                             return(e.sticky && e.status !== "complete");
                         }, false);
                     },
                     /**
                      * This function provides a generic update for a specific
                      * task record.
                      */
                     update: function(record) {
                         let changed = false;

                         console.log("Updating task record id", record.id + ".");
                         update(records => {
                             let entry = records.tasks.find(e => e.id === record.id);

                             if(entry) {
                                record.updatedAt                      = moment().unix();
                                records[records.tasks.indexOf(entry)] = record;
                                changed                               = true;
                             } else {
                                 console.error("Unable to locate a task record with an id of", record.id + ".");
                             }
                             return(records);
                         });

                         if(changed) {
                             this.save();
                         }
                     },
                    /**
                      * This function marks a specified set of task records with
                      * the given status before saving them. If touch is specified
                      * as true then the current date will be added to the tasks
                      * list of active dates.
                      */
                    updateStatusForAll : function(taskIds, status, touch) {
                        let changed = false;

                        if(taskIds.length > 0) {
                            console.log("Marking the following task ids as", status, "- ", taskIds.join(", "));
                            update(records => {
                                records.tasks.forEach(e => {
                                    if(taskIds.indexOf(e.id) !== -1 && e.status !== status) {
                                        console.log("Marking task id", e.id, "as", status + ".");
                                        e.status    = status;
                                        e.updatedAt = moment().unix();
                                        if(touch) {
                                            let today = moment().startOf("day").unix();

                                            if(e.datesActive[e.datesActive.length - 1] != today) {
                                                e.datesActive.push(today);
                                            }
                                        }
                                        changed = true;
                                    }
                                });
                                return(records);
                            });
                        }

                        if(changed) {
                           this.save();
                        }
                    }};

    return(instance);
}

/**
 * A utility function that creates a JS object containing fields appropriate
 * for a task record with default values.
 */
export function createTaskInstance() {
    let instance = {createdAt:   moment().startOf("day").unix(),
                    datesActive: [],
                    description: "",
                    id:          null,
                    notes:       [],
                    status:      "incomplete",
                    sticky:      true,
                    title:       "",
                    updatedAt:   null};
    return(instance);
}

/**
 * A utility function that creates a JS object containing the fields appropriate
 * for a task note.
 */
export function createTaskNote() {
    let timestamp = moment().unix();
    let instance  = {createdAt: timestamp,
                     markdown:  "",
                     status:    "active",
                     updatedAt: null};
    return(instance);
}

/**
 * Export of the records store for application use.
 */
export const records = createTaskInstanceStore();
