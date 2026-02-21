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
}
