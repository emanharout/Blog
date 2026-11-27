<!-- Sample post for the dev-only /dev/type page: every heading level from h2 to h6, rendered by the same pipeline as
     posts, to try the type scale and body fonts against real content. -->

Swift’s concurrency model gives you a handful of tools that look alike at first: tasks, task groups, actors and `async let`. This tour walks through each one, nesting as deep as the topic goes, so you can see how every heading level reads against the ones around it.

## Tasks

A task is a unit of asynchronous work. Every `async` function runs inside one, and you start a new one when synchronous code needs to call into the asynchronous world.[^task]

```swift
Task {
    let posts = try await api.fetchPosts()
    await MainActor.run { self.posts = posts }
}
```

### Structured concurrency

Structured tasks are tied to the scope that created them. When the scope ends, it waits for its child tasks, and cancelling the parent cancels every child. That tree is what makes them easy to reason about.

#### Using `async let`

`async let` starts a child task and lets you await its result later. It’s the lightest way to run two pieces of work side by side:

```swift
async let profile = api.fetchProfile(id)
async let posts = api.fetchPosts(for: id)
let page = try await ProfilePage(profile: profile, posts: posts)
```

##### Cancellation

If the scope exits before you await an `async let`, Swift cancels it and waits for it to finish. Cancellation is cooperative: the task has to check for it.

###### When a child ignores cancellation

A child that never calls `Task.checkCancellation()` or reads `Task.isCancelled` runs to the end anyway. The parent still waits for it, so a slow, uncooperative child holds up the whole scope.

##### Error propagation

When one child throws, the error reaches the parent at the `await`, and the remaining children are cancelled.

###### Errors thrown after cancellation

A child that throws `CancellationError` after the parent has already failed is ignored; only the first error is reported.

#### Using task groups

Task groups handle a number of child tasks you only know at run time:

1. Create the group with `withThrowingTaskGroup(of:)`.
2. Add a child for each item with `group.addTask`.
3. Collect the results with `for try await`.

##### Limiting concurrency

Adding a thousand children at once starts a thousand tasks. To cap it, add a few up front and one more each time a result comes in.

### Unstructured tasks

`Task { }` and `Task.detached { }` aren’t tied to any scope. They’re how synchronous code, like a button action, starts asynchronous work.

> Prefer structured concurrency wherever you can. Reach for an unstructured task only at the boundary where synchronous code meets asynchronous code.

#### Inherited context

`Task { }` inherits the actor and priority of the code that creates it. `Task.detached { }` inherits neither.

## Actors

An actor protects its mutable state by letting only one task touch it at a time. From outside, every access is `async`, and the compiler enforces it.

### Reentrancy

While an actor method is suspended at an `await`, other calls can run on the actor. State you read before the `await` may have changed by the time you resume.

#### A heading long enough to wrap onto a second line, to check line height and balance

Re-check any state you depend on after each `await` inside an actor method, rather than assuming it held still.

## Summary

- **Tasks** are the unit of work.
- **Structured concurrency** (`async let`, task groups) ties work to a scope.
- **Actors** protect state across tasks.

[^task]: Top-level code and `@main` entry points run in a task too, which is why you can `await` there.
