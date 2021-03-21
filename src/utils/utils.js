
import { warn, isObject } from 'x-utils-es'

/**
 * 
 * @param {*} status match available status types 
 */
export const statusTypes = (status) => {
    const o = {
        pending: 0,
        completed: 1
    }
    if (o[status] === undefined) warn('[statusTypes]', `invalid status: ${status} provided`)
    return o[status]
}

export const tasksComplete = (tasks = []) => {
    return tasks.filter(n => n.status === 'completed').length === tasks.length && tasks.length > 0
}

export const tasksPending = (tasks = []) => {
    return tasks.filter(n => n.status === 'pending').length === tasks.length && tasks.length > 0
}

/**
 * fetch handler if status error reject response
 * @param {*} response 
 */
export const fetchHandler = async (response) => { 
    if (response.ok) return response.json()
    else {

        let resp
        try {
            resp = await response.json() // {message,code,error}   
        } catch (err) {
          
            resp = err.toString()
        }
        // if our server is up we know what to expect, else can return empty string
        if (isObject(resp)) {
            return Promise.reject(resp.error || resp.message)
        } else Promise.reject(resp || "HTTP-Error: " + resp.status)
    }
}

/**
 * Update original with new data
 * @param {*} todo data to update with
 * @param {*} source original 
 * @returns `original` modified
 */
export const updateTodoValues = (todo = {}, source) => {

    for (let [k, val] of Object.entries(todo).values()) {
        if (source[k]) source[k] = val
    }
    return source
}

/**
 * Preset post headers
 * @param {*} data 
 */
export const presetPost = (data) => {
    return {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }
}
