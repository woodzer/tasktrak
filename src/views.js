import {writable} from 'svelte/store';

/**
 * This value is used to store the name of the view that preceded the
 * currently selected view.
 */
let previousView = null;

/**
 * This store represents the currently selected view.
 */
export const activeView = writable("day");

/**
 * A list of the valid task names.
 */
const VALID_VIEW_NAMES = ["cleanUpView", "day", "editTask", "reviewTaskView", "standUpView", "weekView"];

/**
 * This function provides a mechanism that can be used to determine whether the
 * previous view setting is available.
 */
export function isPreviousViewSet() {
    if(previousView) {
        return(true);
    } else {
        return(false);
    }
}

/**
 * This function provides the preferred mechanism for interacting with the
 * previous view setting.
 */
export function previousViewName() {
    return(previousView);
}

/**
 * This function provides a mechanism that is intended to be used whenever the
 * user navigates to an interface where, upon completion, they should return
 * to the previous view (e.g. after creating a task). This removes the need for
 * the invoking view to be explicitly tied to a preceding view. Usage of this
 * function clears the previousView setting.
 */
export function revertView() {
    activeView.update(view => {
        let targetView = previousView;

        previousView = null;
        return(targetView);
    });
}

/**
 * This function is used to select a view for display. This is preferential
 * over updating the activeView store directly as it records the previous
 * view as well.
 */
export function selectView(viewName) {
    if(VALID_VIEW_NAMES.indexOf(viewName) !== -1) {
        activeView.update(view => {
            previousView = view;
            return(viewName);
        });
    } else {
        console.error("Unable to select the", viewName, "view as it is not a recognised valid view name.");
    }
}
