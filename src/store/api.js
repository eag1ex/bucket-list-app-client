/**
 * Refer to Bucket List server ./config.js file for details
 */

const apiUrlBase = `http://localhost:5000/bucket`

const api = {
    base: apiUrlBase,
    bucketList: () => `${apiUrlBase}/list`, // GET
    createBucket: () => `${apiUrlBase}/create`, // POST
    updateBucketStatus: (id) => `${apiUrlBase}/${id}/update-status`, // POST
    updateBucketOnlyStatus: (id) => `${apiUrlBase}/${id}/bucket-only-update-status`, // POST
    createSubtask: (id) => `${apiUrlBase}/${id}/rel/subtask/create`, // POST
    updateSubtaskStatus: (todo_id) => `${apiUrlBase}/rel/subtask/${todo_id}/update-status` // POST
}

export { api } // >> Object.freeze(api)
