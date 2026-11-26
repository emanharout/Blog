<!-- Sample post for the dev-only /dev/notes page: plain Markdown footnotes, rendered by the same pipeline as posts. -->

Every type in Swift has a type of its own, called its metatype.[^objc] You reach it with `.self` on the type, and you write it as `Int.Type`. Metatypes let you pass a type around as a value, so you can write a factory that takes `T.Type` and builds whichever concrete type it’s given.

## Static and dynamic metatypes

`Int.self` is the static metatype: the compiler knows exactly which type it is. `type(of:)` gives you the dynamic metatype, the type of a value at run time.[^typeof] The two differ when a value is stored as a superclass or a protocol.

Short notes like the two above sit in the right margin on a wide screen, level with their sentence. A long one opens under its line instead, at every width, because in the margin it would run into the next note.[^long]

## Protocol metatypes

For a protocol, `P.Type` is the metatype of any type that conforms to `P`, while `P.Protocol` is the metatype of the protocol itself.[^protocol] It’s a corner of the language most code never touches, but it explains some confusing compiler errors.

Here’s more body text so the page is long enough to scroll, and so you can watch a margin note fade as it slides up under the table of contents. Metatypes are also how you register a cell class with a table view without creating one first, and how generic code can call a static method or a required initialiser on whatever type it was handed.[^init]

## Where to go next

Another paragraph, so the last notes have room to scroll past the table of contents. When the margin is too narrow (below about 1150 pixels) every note becomes a number you click to open under its line, and hovering a number still shows the note in a tooltip.[^narrow]

One more paragraph for good measure. It has no notes, so you can see how ordinary text reads when nothing is in the margin beside it. The footnote list at the end of the post stays exactly as it was, for anyone who wants to read them all in one place.

[^objc]: The name comes from Objective-C, where every class object is itself an instance of a “metaclass.”
[^typeof]: `type(of:)` arrived in Swift 3, replacing the older `dynamicType` property.
[^long]: This is a deliberately long footnote. It explains something in enough detail that it would be awkward in the narrow margin: it would push the next note down the page, or overlap it, and the reader would lose track of which sentence it belongs to. So instead it opens in place when you click its number, the same way all notes behave on a phone, and you can still hover the number to read it as a tooltip.
[^protocol]: See [SE-0090](https://github.com/apple/swift-evolution/blob/main/proposals/0090-remove-dot-self.md) for some of the history.
[^init]: Calling an initialiser through a metatype needs it to be `required`, so every subclass has it.
[^narrow]: Try it by making the window narrower.
