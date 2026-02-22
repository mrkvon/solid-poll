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
}

/**
 * AnswerActivity Type
 */
export interface AnswerActivity {
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
