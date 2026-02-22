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

Next I set up eslint:

```sh
npm init @eslint/config@latest
```

and Prettier by following https://prettier.io/docs/install.

Later I might add knip.

I also set up Playwright tests:

```sh
npm init playwright@latest -w e2e
```

Now, let's finally get to the development itself!

### Defining behaviour in tests

I like to develop test-first. I write down challenges. Empty tests describing how the system should behave, which I later turn into failing tests, which I'll then make pass. This is process is happening partially in parallel, but this is the general sequence.

So I'll create a test file for each feature, and add unimplemented tests to it.

### Implementing authentication

I'll try out `@uvdsl/solid-oidc-client-browser` as Solid authentication library. I'll install web awesome and use components from there to select oidc issuer or webId, then sign in. I'll show name of the current user after signin.

I write each step in [tests first](../e2e/auth.spec.ts), then I make it pass, then go to the next step, etc.

For the Playwright tests, I also install as dev dependency and run Community Solid Server before the tests. I create random pods for each test with css-authn, so I don't have to worry about clearing them between tests.

### Creating a poll

We're getting deeper into the weeds of Solid now. Let's create a form, allow person to select a folder in their pod, and create a poll.

I use LDO to handle creating RDF.

The UX is very raw now, and can be iteratively improved later.

I converted our SHACL shapes to shex manually, then built LDO typings with @ldo/cli. At the end I went with [SIOC](http://rdfs.org/sioc/ns#) vocabulary, and its extension [SIOC Types](http://rdfs.org/sioc/types#).

### Viewing a poll

Using LDO, I build an interface to view the poll. Later I'll add editing options for signed-in users.

But first, I have to make the poll readable to public. I migrated to @ldo/connected-solid to manage data in the process. It's an elegant and convenient library for managing RDF data, even though it could benefit from some fixes.

Then I actually fetch and display poll data on page.

### Adding an answer

Creating a form and submitting the data is straightforward. What's new is that the poll has an inbox attached to it, and it accepts our activity of adding an answer.

The inbox belongs to a bot that will validate the activity and save my answer to the poll.

It would be possible to save the answer locally on my own Pod and just send a link, but I choose saving it directly on poll for simplicity. It could be added later.

So, a couple of challenges later, adding answers works now, completely unvalidated etc, but the happy path works anyways. This meant building koa agent, accepting and parsing activity in inbox, then saving answer to pod.

On client side this meant figuring out reactivity for LDO. There is a resource.on('update') listener, which is great for re-rendering resources from dataset, when they update. Regrettably, this method is not a part of @ldo/connected-solid types, but it's there and it works. So much for reactivity of LDO resources in Lit.

By this time (second or third day), it's clear this won't be a 1-day quick project.

### Auhenticating and validating inbox requests

Authn is achieved using a middleware based on @solid/access-token-verifier.
Validation must be strict:

- correct shape of data
- actor must match authenticated agent
- check that the authenticated agent has right to perform the action requested

To do this properly, I'll set up integration tests for the agent with Vitest.
