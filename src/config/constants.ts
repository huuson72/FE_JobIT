export const JOB_STATUS = {
    INACTIVE: false,
    ACTIVE: true
} as const;

export const JOB_STATUS_LABEL = {
    [String(false)]: 'INACTIVE',
    [String(true)]: 'ACTIVE'
} as const; 