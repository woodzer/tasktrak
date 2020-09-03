import moment from 'moment';
import {createTaskInstance, records} from './records.js';
import {selectedTask} from './state.js';

/**
 * This function is called to perform an update on the data assocaited with a
 * task note.
 */
export function updateTaskNote(data) {
    console.log("Performing an update on a task note.");
    let offset = data.identifier.noteIndex;

    selectedTask.update(task => {
        if(task.notes.length >= offset) {
            if(!task.notes[offset].updatedAt || task.notes[offset].markdown !== "") {
                task.notes[offset].updatedAt = moment().unix();
            }
            task.notes[offset].markdown  = data.markdown;
            console.log("Note offset", offset, "for the selected task was successfully updated.", task.notes[offset]);
        } else {
            console.error("The selected task does not possess a note at offset", offset + ".");
        }
        return(task);
    });
}