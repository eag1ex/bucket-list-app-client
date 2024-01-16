import { v4 } from 'uuid'

const todoList = [
    {
        id: v4(),
        title: 'Thailand Trip',
        status: 'completed', // [pending/completed]
        created_at: 'Tue Mar 02 2021 10:04:25 GMT+0000 (Greenwich Mean Time)',

        subtasks: [
            {
                todo_id: v4(),
                title: 'Visit Bangkok',
                status: 'pending', // [pending/completed]
                created_at: ''

            },
            {
                todo_id: v4(),
                title: 'Visit Ko Pha-ngan',
                status: 'pending', // [pending/completed]
                created_at: ''

            },
            {
                todo_id: v4(),
                title: 'Visit Chatuchak Park',
                status: 'pending', // [pending/completed]
                created_at: ''

            },

            {
                todo_id: v4(),
                title: 'Visit Chiang Mai',
                status: 'pending', // [pending/completed]
                created_at: ''
            },

            {
                todo_id: v4(),
                title: 'Visit Phuket',
                status: 'pending', // [pending/completed]
                created_at: ''
            }
        ]
    },

    {
        id: v4(),
        title: 'Vietnam Trip',
        status: 'pending', // [pending/completed]
        created_at: 'Mon Mar 02 2021 15:00:16 GMT+0000 (Greenwich Mean Time)',

        subtasks: [
            {
                todo_id: v4(),
                title: 'Cat ba Island',
                status: 'pending', // [pending/completed]
                created_at: ''
            },
            {
                todo_id: v4(),
                title: 'Visit Da Nang',
                status: 'pending', // [pending/completed]
                created_at: ''

            },
            {
                todo_id: v4(),
                title: 'Visit Hanoi',
                status: 'pending', // [pending/completed]
                created_at: ''
            },

            {
                todo_id: v4(),
                title: 'Visit Ha Giang',
                status: 'pending', // [pending/completed]
                created_at: ''

            }
        ]
    },

    {
        id: v4(),
        title: 'Cambodia Trip',
        status: 'pending', // [pending/completed]
        created_at: 'Thur Mar 07 2021 17:09:16 GMT+0000 (Greenwich Mean Time)',
        subtasks: [
            {
                todo_id: v4(),
                title: 'Visit Siem Reap',
                status: 'pending', // [pending/completed]
                created_at: ''

            },

            {
                todo_id: v4(),
                title: 'Visit Angkor Thum',
                status: 'pending', // [pending/completed]
                created_at: ''
            },
            {
                todo_id: v4(),
                title: 'Visit Phnom Penh',
                status: 'pending', // [pending/completed]
                created_at: ''
            }
        ]
    },

    {
        id: v4(),
        title: 'Malaysia Trip',
        status: 'pending', // [pending/completed]
        created_at: 'Tue Mar 07 2021 18:09:16 GMT+0000 (Greenwich Mean Time)',
        subtasks: [
            {
                todo_id: v4(),
                title: 'Visit Kuaka Lumpur',
                status: 'pending', // [pending/completed]
                created_at: ''
            },

            {
                todo_id: v4(),
                title: 'Visit Twin Towers',
                status: 'pending', // [pending/completed]
                created_at: ''

            },
            {
                todo_id: v4(),
                title: 'Visit Penang',
                status: 'pending', // [pending/completed]
                created_at: ''
            }
        ]
    },

    {
        id: v4(),
        title: 'Philipines Trip',
        status: 'pending', // [pending/completed]
        created_at: 'Sun Mar 05 2021 19:09:16 GMT+0000 (Greenwich Mean Time)',
        subtasks: [
            {
                todo_id: v4(),
                title: 'Visit Cebu',
                status: 'pending', // [pending/completed]
                created_at: ''

            },

            {
                todo_id: v4(),
                title: 'Visit Manila',
                status: 'pending', // [pending/completed]
                created_at: ''
            }
        ]
    },
    {
        id: v4(),
        title: 'Africa Trip',
        status: 'pending', // [pending/completed]
        created_at: 'Fri Mar 02 2021 22:09:16 GMT+0000 (Greenwich Mean Time)',
        subtasks: [
            {
                todo_id: v4(),
                title: 'Visit Kenya',
                status: 'pending', // [pending/completed]
                created_at: ''
            },

            {
                todo_id: v4(),
                title: 'Visit Kenay, Mombasa coast',
                status: 'pending', // [pending/completed]
                created_at: ''
            },
            {
                todo_id: v4(),
                title: 'Visit Kenay, Safari',
                status: 'pending', // [pending/completed]
                created_at: ''
            }
        ]
    }

].map((n) => {
    n.created_at = new Date()
    if ((n.subtasks || []).length) {
        n.subtasks = n.subtasks.map((nn) => {
            nn.created_at = new Date()
            return nn
        })
    }
    return n
})

export { todoList }
