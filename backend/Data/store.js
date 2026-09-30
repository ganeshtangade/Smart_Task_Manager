// Data/store.js

// In-memory storage.
// Data will reset when the server restarts.

const users = [];
const tasks = [];

let nextUserId = 1;
let nextTaskId = 1;

function getNextUserId() {
    return nextUserId++;
}

function getNextTaskId() {
    return nextTaskId++;
}

module.exports = {
    users,
    tasks,
    getNextUserId,
    getNextTaskId
};