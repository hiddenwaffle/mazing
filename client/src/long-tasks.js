'use strict';

/**
 * This replaces setTimeout() so the callback can get an elapsed time from the main loop.
 */
class TimeoutTask {

    /**
     * @param time milliseconds to wait before running cb()
     * @param obj argument that will be passed to cb()
     * @param cb function to run when time is up.
     */
    constructor(time, obj, cb) {
        this._time = time;
        this._obj = obj;
        this._cb = cb;

        this._totalElapsed = 0;

        this.completed = false;
    }

    step(elapsed) {
        this._totalElapsed += elapsed;

        if (this._totalElapsed >= this._time) {
            this._cb(this._obj);
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
     * @param obj argument that will be passed to cb()
     * @param cb function to run when time is up; if cb returns false, it will stop reoccurring.
     */
    constructor(time, obj, cb) {
        this._time = time;
        this._obj = obj;
        this._cb = cb;

        this._totalElapsed = 0;

        this.completed = false
    }

    step(elapsed) {
        this._totalElapsed += elapsed;

        if (this._totalElapsed >= this._time) {
            if (this._cb(this._obj) === false) {
                this.completed = true;
            } else {
                this._totalElapsed = 0;
            }
        }
    }
}

class LongTasks {

    constructor() {
        this._tasks = [];
    }

    addTimeoutTask(time, obj, cb) {
        let task = new TimeoutTask(time, obj, cb);
        this._tasks.push(task);
    }

    addIntervalTask(time, obj, cb) {
        let task = new IntervalTask(time, obj, cb);
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

module.exports = LongTasks;