# TaskTrak

This is a simple application I put together using Svelte and Bulma for the
UI side of things. I wanted a simple tool that would allow me to keep track
of tasks I had worked on, so this is what came out of that effort. The
application has the following features...

 * Uses browser local storage for data, nothing is sent to the server. Of
   course this means it won't work if browser local storage is not
   available.

 * Allows for quick creation of tasks via their title only but there's
   also a facility to add additional details.

 * Tasks can be made 'sticky'. Sticky tasks will carry forward from one
   day to the next until they are marked as completed. Sticky is turned
   on by default for tasks.

 * There's a stand up view that shows the tasks that were active today
   and yesterday. This also includes details of how many days in a week
   the particular task was active and how many days in total the task
   has been active.

 * There's a week view that shows all the tasks that were active during
   a particular week along with the total number of days those tasks
   have been active.

I made add other facilities and functionality over time. I've put the
application online for use at http://tasktrak.online - HTTPS will be
added as soon as I get around to it.

## Running The Application Locally

If you want to run the application locally then clone the repository
and run the following commands from within the application folder
created...

```
    $> npm install
    $> npm run dev
```

That should run up a server for the content that will be available on
your local machine at http://localhost:5000.

## To Do

This is currently a work in progress application and should be treated
as such. That said, the following is a list of functionality (in no
particular order) that I think I would like to address...

 * Get HTTPS working on the actual deployment.

 * Get a proper site icon.

 * Add proper unit tests for the code.
