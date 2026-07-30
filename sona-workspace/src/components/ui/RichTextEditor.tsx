'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react'

export function RichTextEditor({
    content,
    onChange
}: {
    content: string,
    onChange: (html: string) => void
}) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                // Hozzáadtuk a prose-strong:text-foreground és társait, hogy felülírjuk a Tailwind fix színeit!
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] p-3 text-foreground prose-strong:text-foreground prose-p:text-foreground prose-headings:text-foreground prose-li:text-foreground',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML()) // HTML formátumban mentjük az adatbázisba
        },
    })

    if (!editor) return null

    return (
        <div className="flex flex-col w-full bg-background border border-border rounded-md shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all">

            {/* ESZKÖZTÁR (Toolbar) */}
            <div className="flex items-center gap-1 bg-sona-neutral/5 p-1 border-b border-border">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded hover:bg-sona-neutral/10 transition-colors ${editor.isActive('bold') ? 'bg-primary/20 text-primary' : 'text-sona-neutral'}`}
                    title="Félkövér"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded hover:bg-sona-neutral/10 transition-colors ${editor.isActive('italic') ? 'bg-primary/20 text-primary' : 'text-sona-neutral'}`}
                    title="Dőlt"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded hover:bg-sona-neutral/10 transition-colors ${editor.isActive('strike') ? 'bg-primary/20 text-primary' : 'text-sona-neutral'}`}
                    title="Áthúzott"
                >
                    <Strikethrough className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-border mx-1" /> {/* Elválasztó vonal */}

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded hover:bg-sona-neutral/10 transition-colors ${editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : 'text-sona-neutral'}`}
                    title="Felsorolás"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded hover:bg-sona-neutral/10 transition-colors ${editor.isActive('orderedList') ? 'bg-primary/20 text-primary' : 'text-sona-neutral'}`}
                    title="Számozott lista"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>
            </div>

            {/* MAGA A SZÖVEGMEZŐ */}
            <div className="cursor-text" onClick={() => editor.commands.focus()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}