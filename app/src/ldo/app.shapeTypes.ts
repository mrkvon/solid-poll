import type { ShapeType } from '@ldo/ldo'
import { appSchema } from './app.schema'
import { appContext } from './app.context'
import type {
  Poll,
  Answer,
  Vote,
  AnswerActivity,
  VoteActivity,
} from './app.typings'

/**
 * =============================================================================
 * LDO ShapeTypes app
 * =============================================================================
 */

/**
 * Poll ShapeType
 */
export const PollShapeType: ShapeType<Poll> = {
  schema: appSchema,
  shape: 'https://example.com/Poll',
  context: appContext,
}

/**
 * Answer ShapeType
 */
export const AnswerShapeType: ShapeType<Answer> = {
  schema: appSchema,
  shape: 'https://example.com/Answer',
  context: appContext,
}

/**
 * Vote ShapeType
 */
export const VoteShapeType: ShapeType<Vote> = {
  schema: appSchema,
  shape: 'https://example.com/Vote',
  context: appContext,
}

/**
 * AnswerActivity ShapeType
 */
export const AnswerActivityShapeType: ShapeType<AnswerActivity> = {
  schema: appSchema,
  shape: 'https://example.com/AnswerActivity',
  context: appContext,
}

/**
 * VoteActivity ShapeType
 */
export const VoteActivityShapeType: ShapeType<VoteActivity> = {
  schema: appSchema,
  shape: 'https://example.com/VoteActivity',
  context: appContext,
}
