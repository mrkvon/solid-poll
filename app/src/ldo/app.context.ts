import type { LdoJsonldContext } from '@ldo/ldo'

/**
 * =============================================================================
 * appContext: JSONLD Context for app
 * =============================================================================
 */
export const appContext: LdoJsonldContext = {
  type: {
    '@id': '@type',
    '@isCollection': true,
  },
  Poll: {
    '@id': 'http://rdfs.org/sioc/types#Poll',
    '@context': {
      type: {
        '@id': '@type',
        '@isCollection': true,
      },
      content: {
        '@id': 'http://rdfs.org/sioc/ns#content',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      description: {
        '@id': 'http://purl.org/dc/terms/description',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      hasReply: {
        '@id': 'http://rdfs.org/sioc/ns#has_reply',
        '@type': '@id',
        '@isCollection': true,
      },
      creator: {
        '@id': 'http://purl.org/dc/terms/creator',
        '@type': '@id',
      },
      created: {
        '@id': 'http://purl.org/dc/terms/created',
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
      },
      modified: {
        '@id': 'http://purl.org/dc/terms/modified',
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@isCollection': true,
      },
      inbox: {
        '@id': 'http://www.w3.org/ns/ldp#inbox',
        '@type': '@id',
      },
    },
  },
  Question: {
    '@id': 'http://rdfs.org/sioc/types#Question',
    '@context': {
      type: {
        '@id': '@type',
        '@isCollection': true,
      },
      content: {
        '@id': 'http://rdfs.org/sioc/ns#content',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      description: {
        '@id': 'http://purl.org/dc/terms/description',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      hasReply: {
        '@id': 'http://rdfs.org/sioc/ns#has_reply',
        '@type': '@id',
        '@isCollection': true,
      },
      creator: {
        '@id': 'http://purl.org/dc/terms/creator',
        '@type': '@id',
      },
      created: {
        '@id': 'http://purl.org/dc/terms/created',
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
      },
      modified: {
        '@id': 'http://purl.org/dc/terms/modified',
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@isCollection': true,
      },
      inbox: {
        '@id': 'http://www.w3.org/ns/ldp#inbox',
        '@type': '@id',
      },
    },
  },
  content: {
    '@id': 'http://rdfs.org/sioc/ns#content',
    '@type': 'http://www.w3.org/2001/XMLSchema#string',
  },
  description: {
    '@id': 'http://purl.org/dc/terms/description',
    '@type': 'http://www.w3.org/2001/XMLSchema#string',
  },
  hasReply: {
    '@id': 'http://rdfs.org/sioc/ns#has_reply',
    '@type': '@id',
    '@isCollection': true,
  },
  Answer: {
    '@id': 'http://rdfs.org/sioc/types#Answer',
    '@context': {
      type: {
        '@id': '@type',
        '@isCollection': true,
      },
      content: {
        '@id': 'http://rdfs.org/sioc/ns#content',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      replyOf: {
        '@id': 'http://rdfs.org/sioc/ns#reply_of',
        '@type': '@id',
      },
      creator: {
        '@id': 'http://purl.org/dc/terms/creator',
        '@type': '@id',
      },
      created: {
        '@id': 'http://purl.org/dc/terms/created',
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
      },
      modified: {
        '@id': 'http://purl.org/dc/terms/modified',
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@isCollection': true,
      },
      hasVote: {
        '@id': 'https://spoll.example/has_vote',
        '@type': '@id',
        '@isCollection': true,
      },
    },
  },
  replyOf: {
    '@id': 'http://rdfs.org/sioc/ns#reply_of',
    '@type': '@id',
  },
  creator: {
    '@id': 'http://purl.org/dc/terms/creator',
    '@type': '@id',
  },
  created: {
    '@id': 'http://purl.org/dc/terms/created',
    '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
  },
  modified: {
    '@id': 'http://purl.org/dc/terms/modified',
    '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
    '@isCollection': true,
  },
  hasVote: {
    '@id': 'https://spoll.example/has_vote',
    '@type': '@id',
    '@isCollection': true,
  },
  VoteAction: {
    '@id': 'https://schema.org/VoteAction',
    '@context': {
      type: {
        '@id': '@type',
        '@isCollection': true,
      },
      object: {
        '@id': 'https://schema.org/object',
        '@type': '@id',
      },
      description: {
        '@id': 'https://schema.org/description',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      creator: {
        '@id': 'http://purl.org/dc/terms/creator',
        '@type': '@id',
      },
      created: {
        '@id': 'http://purl.org/dc/terms/created',
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
      },
      modified: {
        '@id': 'http://purl.org/dc/terms/modified',
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@isCollection': true,
      },
    },
  },
  object: {
    '@id': 'https://schema.org/object',
    '@type': '@id',
  },
  description2: {
    '@id': 'https://schema.org/description',
    '@type': 'http://www.w3.org/2001/XMLSchema#string',
  },
  inbox: {
    '@id': 'http://www.w3.org/ns/ldp#inbox',
    '@type': '@id',
  },
  Create: {
    '@id': 'https://www.w3.org/ns/activitystreams#Create',
    '@context': {
      type: {
        '@id': '@type',
        '@isCollection': true,
      },
      actor: {
        '@id': 'https://www.w3.org/ns/activitystreams#actor',
        '@type': '@id',
      },
      object: {
        '@id': 'https://www.w3.org/ns/activitystreams#object',
        '@type': '@id',
      },
    },
  },
  actor: {
    '@id': 'https://www.w3.org/ns/activitystreams#actor',
    '@type': '@id',
  },
  object2: {
    '@id': 'https://www.w3.org/ns/activitystreams#object',
    '@type': '@id',
  },
  Remove: {
    '@id': 'https://www.w3.org/ns/activitystreams#Remove',
    '@context': {
      type: {
        '@id': '@type',
        '@isCollection': true,
      },
      actor: {
        '@id': 'https://www.w3.org/ns/activitystreams#actor',
        '@type': '@id',
      },
      object: {
        '@id': 'https://www.w3.org/ns/activitystreams#object',
        '@type': '@id',
      },
    },
  },
}
