import jsonld, { JsonLdDocument } from 'jsonld'
import { Middleware } from 'koa'
import { Parser, Store } from 'n3'
import SHACLValidator from 'rdf-validate-shacl'

const shacl = `
@prefix : <#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix as: <https://www.w3.org/ns/activitystreams#> .
@prefix tsioc: <http://rdfs.org/sioc/types#> .
@prefix sioc: <http://rdfs.org/sioc/ns#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

# Shape for Create Activity
:CreateAnswerActivityShape a sh:NodeShape ;
    sh:targetClass as:Create ;
    
    sh:property [
        sh:path as:actor ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:nodeKind sh:IRI ;
        sh:name "actor" ;
    ] ;
    
    sh:property [
        sh:path as:object ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:node :AnswerObjectShape ;
        sh:name "object" ;
    ] .

# Shape for the Answer object
:AnswerObjectShape a sh:NodeShape ;
    sh:targetClass tsioc:Answer ;
    
    sh:property [
        sh:path sioc:content ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:datatype xsd:string ;
        sh:name "content" ;
        sh:minLength 1 ;
        sh:pattern "\\\\S" ;
    ] ;
    
    sh:property [
        sh:path sioc:reply_of ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:nodeKind sh:IRI ;
        sh:name "reply of" ;
    ] .`

const parser = new Parser()

const shaclRdf = parser.parse(shacl)

export const validateActivity: Middleware<{ data: Store }> = async (
  ctx,
  next,
) => {
  const doc = ctx.request.body
  const quads = await jsonld.toRDF(doc as JsonLdDocument, {
    base: 'https://example',
  })
  if (!Array.isArray(quads)) throw new Error('unexpected string output')
  const data = new Store(quads)
  const validator = new SHACLValidator(new Store(shaclRdf))
  const report = await validator.validate(data)

  if (report.conforms) {
    ctx.state.data = data
    await next()
  } else {
    const body = report.results.map(result => ({
      node: result.focusNode?.value,
      path: result.path?.value,
      value: result.value?.value,
      message: result.message.map(msg => msg.value),
    }))

    ctx.body = body
    ctx.status = 400
  }
}
