'use strict';

/**
 * This replaces setTimeout() so the callback can get an elapsed time from the main loop.
 */
class TimeoutTask {

    /**
     * @param time milliseconds to wait before running cb()
     * @param cb function to run when time is up.
     */
    constructor(time, cb) {
        this._time = time;
        this._cb = cb;

        this._totalElapsed = 0;

        this.completed = false;
    }

    step(elapsed) {
        this._totalElapsed += elapsed;

        if (this._totalElapsed >= this._time) {
            this._cb();
            this.completed = true;
        }
    }
}

/**
 * This replaces setInterval() so the callback can get an elapsed time from the main loop.
 */
class IntervalTask {

    /**
     * @param time milliseconds to wait before running cb()
     * @param cb function to run when time is up; if cb returns false, it will stop reoccurring.
     */
    constructor(time, cb) {
        this._time = time;
        this._cb = cb;

        this._totalElapsed = 0;

        this.completed = false
    }

    step(elapsed) {
        this._totalElapsed += elapsed;

        if (this._totalElapsed >= this._time) {
            if (this._cb() === false) {
                this.completed = true;
            } else {
                this._totalElapsed = 0;
            }
        }
    }
}

class Manager {

    constructor() {
        this._tasks = [];
    }

    addTask(task) {
        this._tasks.push(task);
    }

    step(elapsed) {
        for (let task of this._tasks) {
            task.step(elapsed);
        }

        for (let idx = this._tasks.length - 1; idx >= 0; idx--) {
            if (this._tasks[idx].completed) {
                this._tasks.splice(idx, 1);
            }
        }
    }
}

exports.TimeoutTask = TimeoutTask;
exports.IntervalTask = IntervalTask;
exports.Manager = Manager;