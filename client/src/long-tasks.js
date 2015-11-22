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
        this._params = obj;
        this._cb = cb;

        this._totalElapsed = 0;

        this.completed = false;
    }

    step(elapsed) {
        this._totalElapsed += elapsed;

        if (this._totalElapsed >= this._time) {
            this._cb(this._params);
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
     * @param params argument that will be passed to cb()
     * @param cb function to run when time is up; if cb returns false, it will stop reoccurring.
     */
    constructor(time, params, cb) {
        this._time = time;
        this._params = params;
        this._cb = cb;

        this._totalElapsed = 0;

        this.completed = false
    }

    step(elapsed) {
        this._totalElapsed += elapsed;

        if (this._totalElapsed >= this._time) {
            if (this._cb(this._params) === false) {
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

    addTimeoutTask(time, params, cb) {
        let task = new TimeoutTask(time, params, cb);
        this._tasks.push(task);
    }

    addIntervalTask(time, params, cb) {
        let task = new IntervalTask(time, params, cb);
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