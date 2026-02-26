import type { LdoJsonldContext, LdSet } from '@ldo/ldo'

/**
 * =============================================================================
 * Typescript Typings for app
 * =============================================================================
 */

/**
 * Poll Type
 */
export interface Poll {
  '@id'?: string
  '@context'?: LdoJsonldContext
  type: LdSet<
    | {
        '@id': 'Poll'
      }
    | {
        '@id': 'Question'
      }
  >
  /**
   * question text
   */
  content: string
  /**
   * question detail / context
   */
  description?: string
  /**
   * answers
   */
  hasReply?: LdSet<Answer>
  creator: {
    '@id': string
  }
  created: string
  modified?: LdSet<string>
  inbox: {
    '@id': string
  }
}

/**
 * Answer Type
 */
export interface Answer {
  '@id'?: string
  '@context'?: LdoJsonldContext
  type: LdSet<{
    '@id': 'Answer'
  }>
  /**
   * answer text
   */
  content: string
  replyOf: Poll
  creator: {
    '@id': string
  }
  created: string
  modified?: LdSet<string>
  hasVote?: LdSet<Vote>
}

/**
 * Vote Type
 */
export interface Vote {
  '@id'?: string
  '@context'?: LdoJsonldContext
  type: LdSet<{
    '@id': 'VoteAction'
  }>
  /**
   * answer that was voted on
   */
  object: Answer
  /**
   * vote reason or context
   */
  description: string
  creator: {
    '@id': string
  }
  created: string
  modified?: LdSet<string>
}

/**
 * CreateAnswerActivity Type
 */
export interface CreateAnswerActivity {
  '@id'?: string
  '@context'?: LdoJsonldContext
  type: LdSet<{
    '@id': 'Create'
  }>
  actor: {
    '@id': string
  }
  object: Answer
}

/**
 * RemoveAnswerActivity Type
 */
export interface RemoveAnswerActivity {
  '@id'?: string
  '@context'?: LdoJsonldContext
  type: LdSet<{
    '@id': 'Remove'
  }>
  actor: {
    '@id': string
  }
  object: Answer
}

/**
 * CreateVoteActivity Type
 */
export interface CreateVoteActivity {
  '@id'?: string
  '@context'?: LdoJsonldContext
  type: LdSet<{
    '@id': 'Create'
  }>
  actor: {
    '@id': string
  }
  object: Vote
}

/**
 * RemoveVoteActivity Type
 */
export interface RemoveVoteActivity {
  '@id'?: string
  '@context'?: LdoJsonldContext
  type: LdSet<{
    '@id': 'Remove'
  }>
  actor: {
    '@id': string
  }
  object: Vote
}
