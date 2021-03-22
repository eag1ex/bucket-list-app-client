/**
 * Refer to Bucket List server ./config.js file for details
 * REACT_APP_API_URL vars are set in `.env.{xxx} files
 */

let apiUrlBase = process.env.REACT_APP_API_URL

if (!apiUrlBase) {
    console.error('apiUrlBase is empty!')
}
// NOTE for this test we dont need auth Bearer since the production

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
