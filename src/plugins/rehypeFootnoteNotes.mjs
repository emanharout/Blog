// Copies each Markdown footnote (`[^1]` … `[^1]: text`) next to its number, so the note can be read in place:
// in the right margin on wide screens, or opened under its line on smaller ones (src/scripts/footnoteNotes.ts,
// styles in src/styles/input.css). The footnote list at the end of the post stays as it is.
//
// After each footnote number (`<sup><a data-footnote-ref>`) it adds:
//   <span class="fn-note" data-fn-note data-fn-size="short|long" id="fn-note-…">
//     <span class="fn-note-inner"><span class="fn-note-num">1</span><span class="fn-note-p">…</span></span>
//   </span>
// Spans only, because the note sits inside a paragraph. Footnotes made of more than paragraphs (lists, code) aren't
// copied; their numbers still link to the list and show the note on hover.
//
// It also puts the footnote list in a <details>, so the end of the post shows a "Footnotes" button that opens it.

// Notes longer than this (in characters), or of more than one paragraph, open under their line at every width
// instead of going to the margin, where they would run into the next note.
const MARGIN_NOTE_MAX_LENGTH = 240;

const isElement = (node, tagName) => node?.type === 'element' && (!tagName || node.tagName === tagName);

function textOf(node) {
    if (node.type === 'text') return node.value;
    return (node.children ?? []).map(textOf).join('');
}

// A deep copy without ids (the copy would otherwise repeat them) and without the "back to text" links.
function copyWithoutIds(node) {
    if (node.type !== 'element') return { ...node };
    const { id, ...properties } = node.properties ?? {};
    return {
        ...node,
        properties,
        children: node.children
            .filter((child) => !(isElement(child, 'a') && child.properties?.dataFootnoteBackref !== undefined))
            .map(copyWithoutIds),
    };
}

function walk(node, visit, parent) {
    visit(node, parent);
    for (const child of [...(node.children ?? [])]) walk(child, visit, node);
}

export default function rehypeFootnoteNotes() {
    return (tree) => {
        // The footnote list items, by id (`user-content-fn-1`).
        const footnotes = new Map();
        walk(tree, (node) => {
            if (isElement(node, 'li') && String(node.properties?.id ?? '').includes('fn-')) {
                footnotes.set(node.properties.id, node);
            }
        });
        if (footnotes.size === 0) return;

        // Each footnote number: `<sup><a href="#user-content-fn-1" data-footnote-ref>1</a></sup>`.
        const references = [];
        walk(tree, (node, parent) => {
            if (!isElement(node, 'sup') || !parent) return;
            const link = node.children.find((child) => isElement(child, 'a') && child.properties?.dataFootnoteRef !== undefined);
            if (link) references.push({ sup: node, link, parent });
        });

        for (const { sup, link, parent } of references) {
            const footnote = footnotes.get(decodeURIComponent(String(link.properties.href ?? '').slice(1)));
            const blocks = (footnote?.children ?? []).filter((child) => child.type !== 'text' || child.value.trim());
            if (!blocks.length || !blocks.every((block) => isElement(block, 'p'))) continue;

            const noteId = `fn-note-${String(link.properties.id ?? '').replace(/^.*fnref-/, '')}`;
            const isLong = blocks.length > 1 || textOf(footnote).trim().length > MARGIN_NOTE_MAX_LENGTH;
            const number = textOf(link).trim();

            link.properties.ariaControls = noteId;
            link.properties.ariaExpanded = 'false';

            const note = {
                type: 'element',
                tagName: 'span',
                properties: { className: ['fn-note'], id: noteId, dataFnNote: '', dataFnSize: isLong ? 'long' : 'short' },
                children: [
                    {
                        type: 'element',
                        tagName: 'span',
                        properties: { className: ['fn-note-inner'] },
                        children: [
                            {
                                type: 'element',
                                tagName: 'span',
                                properties: { className: ['fn-note-num'], ariaHidden: 'true' },
                                children: [{ type: 'text', value: number }],
                            },
                            ...blocks.map((paragraph) => ({
                                ...copyWithoutIds(paragraph),
                                tagName: 'span',
                                properties: { className: ['fn-note-p'] },
                            })),
                        ],
                    },
                ],
            };
            parent.children.splice(parent.children.indexOf(sup) + 1, 0, note);
        }

        // The list, closed behind a "Footnotes" button.
        walk(tree, (node, parent) => {
            if (!isElement(node, 'section') || node.properties?.dataFootnotes === undefined || !parent) return;
            const details = {
                type: 'element',
                tagName: 'details',
                properties: { className: ['footnotes-toggle'], dataFootnotesToggle: '' },
                children: [
                    {
                        type: 'element',
                        tagName: 'summary',
                        properties: {},
                        children: [
                            { type: 'text', value: 'Footnotes' },
                            {
                                type: 'element',
                                tagName: 'span',
                                properties: { className: ['footnotes-count'] },
                                children: [{ type: 'text', value: String(footnotes.size) }],
                            },
                        ],
                    },
                    node,
                ],
            };
            parent.children.splice(parent.children.indexOf(node), 1, details);
        });
    };
}
