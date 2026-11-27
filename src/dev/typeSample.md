<!-- Sample post for the dev-only /dev/type page, rendered by the same pipeline as posts. It's dense with headings on
     purpose: a ladder of all six levels back to back, deep nesting, headings straight after headings, jumps back up
     the tree, headings with code, and long headings that wrap, to see how each level reads against the others. -->

Swift’s concurrency model gives you a handful of tools that look alike at first: tasks, task groups, actors and `async let`. This tour walks through each one, nesting as deep as the topic goes, so you can see how every heading level reads against the ones around it.

# The heading ladder

Every level once, in order, with one line of text under each.

## Level two: a major section

Sections like this one split a post into its main parts.

### Level three: a subsection

A subsection narrows the topic within its section.

#### Level four: a topic

A topic is one idea inside a subsection.

##### Level five: a detail

A detail sits under a topic, often a case or a caveat.

###### Level six: an aside

An aside is the smallest step, a note on a detail.

## Back to back

The same ladder with no text between the headings, to see how the levels stack.

### Structured concurrency

#### Child tasks

##### Priority

###### Escalation

When a high-priority task awaits a lower-priority child, Swift raises the child’s priority until it finishes.

# Tasks

A task is a unit of asynchronous work. Every `async` function runs inside one, and you start a new one when synchronous code needs to call into the asynchronous world.[^task]

```swift
Task {
    let posts = try await api.fetchPosts()
    await MainActor.run { self.posts = posts }
}
```

## Structured concurrency

Structured tasks are tied to the scope that created them. When the scope ends, it waits for its child tasks, and cancelling the parent cancels every child. That tree is what makes them easy to reason about.

### Using `async let`

`async let` starts a child task and lets you await its result later. It’s the lightest way to run two pieces of work side by side:

```swift
async let profile = api.fetchProfile(id)
async let posts = api.fetchPosts(for: id)
let page = try await ProfilePage(profile: profile, posts: posts)
```

#### Cancellation

If the scope exits before you await an `async let`, Swift cancels it and waits for it to finish. Cancellation is cooperative: the task has to check for it.

##### Checking with `Task.isCancelled`

Read `Task.isCancelled` in a loop and stop early when it turns true.

###### When a child ignores cancellation

A child that never checks runs to the end anyway. The parent still waits for it, so a slow, uncooperative child holds up the whole scope.

###### Cleaning up with `withTaskCancellationHandler`

The handler runs as soon as the task is cancelled, even while it’s suspended, so you can cancel a network request or close a file.

##### Checking with `Task.checkCancellation()`

`Task.checkCancellation()` throws `CancellationError`, which unwinds the task through its normal error path.

#### Error propagation

When one child throws, the error reaches the parent at the `await`, and the remaining children are cancelled.

##### The first error wins

###### Errors thrown after cancellation

A child that throws `CancellationError` after the parent has already failed is ignored; only the first error is reported.

### Using task groups

Task groups handle a number of child tasks you only know at run time:

1. Create the group with `withThrowingTaskGroup(of:)`.
2. Add a child for each item with `group.addTask`.
3. Collect the results with `for try await`.

#### Limiting concurrency

Adding a thousand children at once starts a thousand tasks. To cap it, add a few up front and one more each time a result comes in.

##### A sliding window

Start with a window of, say, eight children. Each finished result makes room for one more.

###### Choosing the window size

Match it to the resource you’re protecting: a server’s rate limit, open file handles, or memory.

#### Discarding task groups

When children return nothing, `withDiscardingTaskGroup` frees each child as soon as it finishes instead of keeping its result.

## Unstructured tasks

`Task { }` and `Task.detached { }` aren’t tied to any scope. They’re how synchronous code, like a button action, starts asynchronous work.

> Prefer structured concurrency wherever you can. Reach for an unstructured task only at the boundary where synchronous code meets asynchronous code.

### Inherited context

`Task { }` inherits the actor and priority of the code that creates it. `Task.detached { }` inherits neither.

#### Task-local values

Task-local values flow down to child tasks and to `Task { }`, but not to `Task.detached { }`.

##### Declaring one

- Mark a static property with `@TaskLocal`.
- Bind it for a scope with `withValue(_:operation:)`.

###### A common use

Request IDs for logging, so every line from one request shares the same ID without passing it by hand.

### Keeping a handle

Store the `Task` you create if you need to cancel it later, for example when a view disappears.

# Actors

An actor protects its mutable state by letting only one task touch it at a time. From outside, every access is `async`, and the compiler enforces it.

## Isolation

Code inside the actor reads its state synchronously. Code outside has to `await`.

### `nonisolated` members

A `nonisolated` method or computed property can be called synchronously from anywhere, but can’t touch the actor’s mutable state.

#### When to use it

For constants and protocol requirements like `Hashable` that must be synchronous.

## Reentrancy

While an actor method is suspended at an `await`, other calls can run on the actor. State you read before the `await` may have changed by the time you resume.

### A heading long enough to wrap onto a second line, to check line height and balance at level three

#### A heading long enough to wrap onto a second line, to check line height and balance at level four

##### A heading long enough to wrap onto a second line, to check line height and balance at level five

###### A heading long enough to wrap onto a second line, to check line height and balance at level six

Re-check any state you depend on after each `await` inside an actor method, rather than assuming it held still.

## Global actors

### `@MainActor`

The main actor runs on the main thread. UI code belongs here.

#### Marking a whole type

Put `@MainActor` on a class to isolate every member to the main thread.

##### Opting one member out

Mark the member `nonisolated`.

#### Hopping to it

Use `await MainActor.run { }` from other code, or call any `@MainActor` function with `await`.

### Custom global actors

Declare your own with `@globalActor` when several types must share one serial context, like a database.

# Summary

## What to reach for

- **Tasks** are the unit of work.
- **Structured concurrency** (`async let`, task groups) ties work to a scope.
- **Actors** protect state across tasks.

### In one line

Start structured, isolate shared state in actors, and use unstructured tasks only at the edges.

[^task]: Top-level code and `@main` entry points run in a task too, which is why you can `await` there.
