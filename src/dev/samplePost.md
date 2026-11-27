<!-- Sample post for the dev-only /dev/sample-post page: reads like a real post, with h2 sections and h3–h6 nested
     inside, quotes, code, a list and a footnote, to judge fonts and heading styles on realistic content. -->

When I started writing SwiftUI full time a year ago, I thought the hard part would be layout. It wasn’t. Stacks, frames and modifiers clicked within a few weeks. What took me the whole year was state: where it lives, who owns it, and how changes flow through an app without turning into a tangle of bindings nobody can follow.

This post is the guide I wish I’d had on day one. It isn’t a tour of every property wrapper. It’s the handful of rules I now reach for without thinking, and the mistakes that taught me each one.

<!-- Kept short, so every heading level fits on one screen for comparing fonts -->

## State at a glance

The whole post in a few lines.

### Ownership

Exactly one place should change a value.

#### Start with `@State`

It’s for data only one view needs.

##### Keep it private

Nothing outside the view should set it.

###### Even in previews

Pass a starting value in instead.

### Sharing

Pass a model down, not a chain of bindings.

## Tools at a glance

### Observation

Views track only the properties they read.

### The environment

Save it for the few things the whole app needs.

## Where state lives

Every bug I chased in my first few months came back to the same question: who owns this value? SwiftUI rebuilds views constantly, so a value has to live somewhere that survives those rebuilds, and exactly one place should be allowed to change it.

Once I started asking that question before writing a view, rather than after, most of my state problems disappeared.

### `@State` is for the view’s own data

`@State` is the simplest answer, and it’s the right one more often than I expected. If a value only matters to one view, like whether a disclosure group is open or what’s typed into a search field, it belongs in `@State` and nowhere else.

```swift
struct SearchBar: View {
    @State private var query = ""
    @State private var isEditing = false

    var body: some View {
        TextField("Search", text: $query)
            .onSubmit { isEditing = false }
    }
}
```

The `private` matters. It’s a reminder that nothing outside the view should set this value, and the compiler will hold you to it.

#### Value types first

For a long time I wrapped everything in classes out of habit. Most of the time a struct was the better choice: it’s copied rather than shared, so two views can’t quietly change the same thing behind each other’s backs. I now start with a struct and reach for a class only when something truly needs a shared identity, like a network session or a document that several screens edit.

### Bindings

A binding is a view saying, “I don’t own this, but I’m allowed to change it.” A toggle row, a stepper and a text field are all good examples. They’re small, reusable pieces that edit a value someone else keeps.

#### When a binding is the wrong tool

Bindings are so convenient that it’s tempting to pass them everywhere. I once had a settings screen where a binding travelled through four views before anything used it. Every view in between had to know about a value it didn’t care about.

The fix was to stop passing the value down and pass a small model instead, which each view could read from as much or as little as it needed.

##### Derived values

If a value can be computed from other state, compute it. Don’t store it. I had a `filteredItems` array that I kept in sync by hand, and it drifted out of date in at least three different ways before I replaced it with a computed property.

###### A note on performance

Computing on every render sounds expensive, but for most lists it’s nothing. Measure before you cache, and when you do cache, make sure there’s one obvious place that invalidates it.

## Observation changed everything

The Observation framework, which arrived with iOS 17, did more for my code than any other change this year. Views now track exactly the properties they read in `body`, so a change to one property only updates the views that use it.

> There are only two hard things in Computer Science: cache invalidation and naming things.
>
> — Phil Karlton

I think about that line a lot, because Observation quietly solves a big piece of the first problem for you. SwiftUI knows what each view depends on, so it knows what to redraw.

### Migrating from `ObservableObject`

Moving an existing model over was mostly deleting code. The class gets the `@Observable` macro, `@Published` goes away, and the views that held the model with `@StateObject` use `@State` instead.

```swift
@Observable
final class Library {
    var books: [Book] = []
    var selection: Book.ID?

    var selectedBook: Book? {
        books.first { $0.id == selection }
    }
}
```

#### The property wrapper cleanup

Before the migration, a typical screen of mine had `@StateObject`, `@ObservedObject` and `@EnvironmentObject` scattered through it, and I had to remember which one to use where. Afterwards most views hold a plain property, and the only wrappers left are `@State` for ownership and `@Bindable` when a view needs bindings into the model.

##### Gotcha: properties Observation ignores

Anything marked `@ObservationIgnored` isn’t tracked, which is exactly what you want for caches and loggers. It is not what you want for something a view displays. I spent an afternoon wondering why a label wouldn’t update before noticing I had copied that attribute along with the property above it.

### Passing models through the environment

For data that most of the app needs, like the signed-in account or app-wide settings, the environment beats passing values by hand. You attach the model once near the top of the hierarchy and read it wherever it’s needed with `@Environment(Account.self)`.

The trade-off is that the dependency becomes invisible. A view that reads from the environment won’t say so in its initializer, so I keep the environment for a few truly global things and pass everything else explicitly.

## Testing state without the simulator

The best side effect of moving logic into small observable models was that I could finally test it. A model is just a class: create it, call a method and check the result, with no views or simulator involved.

> Everyone knows that debugging is twice as hard as writing a program in the first place. So if you’re as clever as you can be when you write it, how will you ever debug it?
>
> — Brian Kernighan

That quote changed how I write models. If a test needs a paragraph of setup, the model is too clever, and I split it until each piece is boring to test.

### Previews as a second test suite

Previews aren’t tests, but they catch a whole class of bugs that tests don’t: the empty state nobody designed, the title that wraps onto three lines, the dark-mode color that disappears. I now add a preview for every state a view can be in, not only the happy path.[^previews]

#### Fixtures

All of those previews need data, so I keep a small set of fixtures next to each model:

1. An empty model, for first launch.
2. A typical model, with a realistic amount of data.
3. A stress model, with very long names and hundreds of items.

##### Naming fixtures

Name fixtures after the situation, not the data. `Library.firstLaunch` tells the next reader why it exists, where `Library.empty` only tells them what’s in it.

###### Keeping fixtures honest

Fixtures go stale as models change. Mine live in the same file as the model they describe, so a change to one is right next to the other.

## What I’d tell myself a year ago

If I could send one note back to the start of the year, it would be short:

- Decide who owns a value before you write the view that shows it.
- Start with `@State` and a struct. Reach for more only when you feel the need.
- Compute what you can, and store only what you must.
- Move logic into small models, then test those models directly.

None of this is new, and most of it is in Apple’s documentation. But it took a year of real bugs before it stopped being advice and became how I think. I hope it takes you a little less.

[^previews]: A preview for each state also makes design reviews easier: you can open one file and see every version of a screen side by side.
