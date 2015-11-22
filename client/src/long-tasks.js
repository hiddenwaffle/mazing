'use strict';

/**
 * This replaces setTimeout() so the callback can get an elapsed time from the main loop.
 */
class LongTask {

    /**
     * @param time milliseconds to wait before running cb()
     * @param cb function that takes no arguments; returning false will requeue the task after running
     */
    constructor(time, cb) {
        this.time = time;
        this._totalElapsed = 0;
        this.cb = cb;

        this.completed = false;
    }

    step(elapsed) {
        this._totalElapsed += elapsed;

        if (this._totalElapsed >= this.time) {
            this.cb();
            this.completed = true;
        }
    }
}

class LongTasks {

    constructor() {
        this._tasks = [];
    }

    addTimeoutTask(time, cb) {
        let task = new LongTask(time, cb);
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