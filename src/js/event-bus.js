'use strict';

class EventBus {

    constructor() {
        this._handlersMap = new Map();
    }

    /**
     * @param name name of event to handle
     * @param handler callback to run when the event occurs
     */
    register(name, handler) {
        let handlers;

        if (this._handlersMap.has(name) == false) {
            handlers = [];
            this._handlersMap.set(name, handlers);
        } else {
            handlers = this._handlersMap.get(name);
        }

        handlers.push(handler);

        // TODO: It would be better if this returned a function that could be called to unregister it.
    }

    unregister(name, handler) {
        if (this._handlersMap.has(name)) {
            let handlers = this._handlersMap.get(name);
            let idx = handlers.indexOf(handler);
            if (idx !== -1) {
                handlers.splice(idx, 1);
            } else {
                console.warn('Attempted to remove unregistered handler for event: ' + name);
            }
        } else {
            console.warn('Attempted to remove handler for unregistered event: ' + name);
        }
    }

    /**
     * @param event an object with structure: { name: 'eventname', args: [1,2,3,4] }
     */
    fire(event) {
        let { name, args } = event;

        if (this._handlersMap.has(name)) {
            let handlers = this._handlersMap.get(name);
            for (let handler of handlers) {
                if (handler !== null && handler !== undefined) {
                    handler(args);
                }
            }
        }
    }
}

const eventBus = new EventBus();
module.exports = eventBus;