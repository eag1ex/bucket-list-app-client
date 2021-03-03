

import {  warn } from 'x-utils-es'

/**
 * 
 * @param {*} status match available status types 
 */
export const statusTypes =(status) => {
    const o = {
        pending: 0,
        completed: 1
    }
    if (o[status] === undefined) warn('[statusTypes]', `invalid status: ${status} provided`)
    return o[status]
}
