import type { CollectionBeforeChangeHook } from 'payload'

/**
 * MCP-værktøjerne kan ikke sætte status, så alt der oprettes eller rettes via MCP ville blive kladder.
 * Her udgives det med det samme, som aftalt. Tidligere versioner ligger i versionshistorikken og kan gendannes i admin.
 */
export const publishWhenViaMcp: CollectionBeforeChangeHook = ({ data, req }) =>
  req.payloadAPI === 'MCP' ? { ...data, _status: 'published' } : data
