import type { Schema } from 'shexj'

/**
 * =============================================================================
 * appSchema: ShexJ Schema for app
 * =============================================================================
 */
export const appSchema: Schema = {
  type: 'Schema',
  shapes: [
    {
      id: 'https://example.com/Poll',
      type: 'ShapeDecl',
      shapeExpr: {
        type: 'Shape',
        expression: {
          type: 'EachOf',
          expressions: [
            {
              type: 'TripleConstraint',
              predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              valueExpr: {
                type: 'NodeConstraint',
                values: ['http://rdfs.org/sioc/types#Poll'],
              },
            },
            {
              type: 'TripleConstraint',
              predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              valueExpr: {
                type: 'NodeConstraint',
                values: ['http://rdfs.org/sioc/types#Question'],
              },
            },
            {
              type: 'TripleConstraint',
              predicate: 'http://rdfs.org/sioc/ns#content',
              valueExpr: {
                type: 'NodeConstraint',
                datatype: 'http://www.w3.org/2001/XMLSchema#string',
              },
              annotations: [
                {
                  type: 'Annotation',
                  predicate: 'http://www.w3.org/2000/01/rdf-schema#comment',
                  object: {
                    value: 'question text',
                  },
                },
              ],
            },
            {
              type: 'TripleConstraint',
              predicate: 'http://purl.org/dc/terms/description',
              valueExpr: {
                type: 'NodeConstraint',
                datatype: 'http://www.w3.org/2001/XMLSchema#string',
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: 'Annotation',
                  predicate: 'http://www.w3.org/2000/01/rdf-schema#comment',
                  object: {
                    value: 'question detail / context',
                  },
                },
              ],
            },
            {
              type: 'TripleConstraint',
              predicate: 'http://rdfs.org/sioc/ns#has_reply',
              valueExpr: 'https://example.com/Answer',
              min: 0,
              max: -1,
              annotations: [
                {
                  type: 'Annotation',
                  predicate: 'http://www.w3.org/2000/01/rdf-schema#comment',
                  object: {
                    value: 'answers',
                  },
                },
              ],
            },
            {
              type: 'TripleConstraint',
              predicate: 'http://purl.org/dc/terms/creator',
              valueExpr: {
                type: 'NodeConstraint',
                nodeKind: 'iri',
              },
            },
            {
              type: 'TripleConstraint',
              predicate: 'http://purl.org/dc/terms/created',
              valueExpr: {
                type: 'NodeConstraint',
                datatype: 'http://www.w3.org/2001/XMLSchema#dateTime',
              },
            },
            {
              type: 'TripleConstraint',
              predicate: 'http://purl.org/dc/terms/modified',
              valueExpr: {
                type: 'NodeConstraint',
                datatype: 'http://www.w3.org/2001/XMLSchema#dateTime',
              },
              min: 0,
              max: -1,
            },
            {
              type: 'TripleConstraint',
              predicate: 'http://www.w3.org/ns/ldp#inbox',
              valueExpr: {
                type: 'NodeConstraint',
                nodeKind: 'iri',
              },
            },
          ],
        },
        extra: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'],
      },
    },
    {
      id: 'https://example.com/Answer',
      type: 'ShapeDecl',
      shapeExpr: {
        type: 'Shape',
        expression: {
          type: 'EachOf',
          expressions: [
            {
              type: 'TripleConstraint',
              predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              valueExpr: {
                type: 'NodeConstraint',
                values: ['http://rdfs.org/sioc/types#Answer'],
              },
            },
            {
              type: 'TripleConstraint',
              predicate: 'http://rdfs.org/sioc/ns#content',
              valueExpr: {
                type: 'NodeConstraint',
                datatype: 'http://www.w3.org/2001/XMLSchema#string',
              },
              annotations: [
                {
                  type: 'Annotation',
                  predicate: 'http://www.w3.org/2000/01/rdf-schema#comment',
                  object: {
                    value: 'answer text',
                  },
                },
              ],
            },
            {
              type: 'TripleConstraint',
              predicate: 'http://rdfs.org/sioc/ns#reply_of',
              valueExpr: 'https://example.com/Poll',
            },
            {
              type: 'TripleConstraint',
              predicate: 'http://purl.org/dc/terms/creator',
              valueExpr: {
                type: 'NodeConstraint',
                nodeKind: 'iri',
              },
            },
            {
              type: 'TripleConstraint',
              predicate: 'http://purl.org/dc/terms/created',
              valueExpr: {
                type: 'NodeConstraint',
                datatype: 'http://www.w3.org/2001/XMLSchema#dateTime',
              },
            },
            {
              type: 'TripleConstraint',
              predicate: 'http://purl.org/dc/terms/modified',
              valueExpr: {
                type: 'NodeConstraint',
                datatype: 'http://www.w3.org/2001/XMLSchema#dateTime',
              },
              min: 0,
              max: -1,
            },
          ],
        },
        extra: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'],
      },
    },
    {
      id: 'https://example.com/AnswerActivity',
      type: 'ShapeDecl',
      shapeExpr: {
        type: 'Shape',
        expression: {
          type: 'EachOf',
          expressions: [
            {
              type: 'TripleConstraint',
              predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              valueExpr: {
                type: 'NodeConstraint',
                values: ['https://www.w3.org/ns/activitystreams#Create'],
              },
            },
            {
              type: 'TripleConstraint',
              predicate: 'https://www.w3.org/ns/activitystreams#actor',
              valueExpr: {
                type: 'NodeConstraint',
                nodeKind: 'iri',
              },
            },
            {
              type: 'TripleConstraint',
              predicate: 'https://www.w3.org/ns/activitystreams#object',
              valueExpr: 'https://example.com/Answer',
            },
          ],
        },
        extra: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'],
      },
    },
  ],
}
