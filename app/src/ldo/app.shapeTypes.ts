import type { ShapeType } from '@ldo/ldo'
import { appSchema } from './app.schema'
import { appContext } from './app.context'
import type {
  Poll,
  Answer,
  Vote,
  CreateAnswerActivity,
  RemoveAnswerActivity,
  CreateVoteActivity,
  RemoveVoteActivity,
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
 * CreateAnswerActivity ShapeType
 */
export const CreateAnswerActivityShapeType: ShapeType<CreateAnswerActivity> = {
  schema: appSchema,
  shape: 'https://example.com/CreateAnswerActivity',
  context: appContext,
}

/**
 * RemoveAnswerActivity ShapeType
 */
export const RemoveAnswerActivityShapeType: ShapeType<RemoveAnswerActivity> = {
  schema: appSchema,
  shape: 'https://example.com/RemoveAnswerActivity',
  context: appContext,
}

/**
 * CreateVoteActivity ShapeType
 */
export const CreateVoteActivityShapeType: ShapeType<CreateVoteActivity> = {
  schema: appSchema,
  shape: 'https://example.com/CreateVoteActivity',
  context: appContext,
}

/**
 * RemoveVoteActivity ShapeType
 */
export const RemoveVoteActivityShapeType: ShapeType<RemoveVoteActivity> = {
  schema: appSchema,
  shape: 'https://example.com/RemoveVoteActivity',
  context: appContext,
}
