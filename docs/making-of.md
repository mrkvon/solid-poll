# Making of Open Poll app with Solid protocol

The challenge is to build this within 24 hours.

## Thinking about intended usage, UX

I started by thinking how the app should function, and draw UX. I usually do this with pencil and a piece of paper.

The app consists of frontent interface, and bot.

- You create a poll document in your pod. You ask a question and optionally write a paragraph of context.
- You share a link that looks like https://solidpoll.example/polls/{URL encoded document}
- People can sign in with their Solid identity and provide an answer.
- People can also add their vote for the answer and optional detail why, context, etc.
- People can edit and delete their answer as long as nobody else voted on it.
- People can edit and delete their vote all the time.
- People can provide multiple answers per person, and one vote per answer per person.

This can be generalized in the future, but this is a start, because this is what I need at the moment. It's not for a private election, but for understanding where people are coming from.

I also thought whether all data should be centralized within the document, or decentralized. We start with one central document, people sending activities to inbox managed by bot, and bot processing them.

## Designing data structure

I did this with help of [LOV](https://lov.linkeddata.es/dataset/lov/), and with LLM claude-opus-4-6-thinking (and potentially other Claude models) via https://arena.ai. There were 2 primary options, using schema.org and SIOC. I ended up prioritizing schema.org, although this could be changed in the future. I like SIOC, too, but it misses the concept of Vote, whereas schema.org has VoteAction.

The unedited results are in [schema.org shape](../schema/poll-schema.shacl) and [SIOC shape](../schema/poll-sioc.shacl). I ran them through [turtle validator](http://ttl.summerofcode.be/) already, and I may need to check whether it's sound and whether AI hasn't hallucinated any terms etc.

## Developing

### Setting things up

Next, let's start building the app. It will be a Vite + Lit app. Recently I started enjoying building with web standards, and Lit is as close to that as one can get. I will use [Web Awesome](https://webawesome.com/) for UI components.

The agent hosting the inbox and processing entries will be a koa server. So, let's turn this project into a npm workspace with app and agent packages with `npm init`.

Afterwards I initialized the frontend app with

```sh
npm create vite@latest app
```

Next, I set up koa server within agent workspace.

Next I set up some best practices for code quality with eslint, prettier, and knip.

TODO next:

- playwright




