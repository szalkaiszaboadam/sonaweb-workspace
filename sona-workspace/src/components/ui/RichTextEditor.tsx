'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react'
import { useEffect } from 'react'

export function RichTextEditor({
    content,
    onChange,
    editable = true // <-- ÚJ PROP: Alapból szerkeszthető
}: {
    content: string,
    onChange: (html: string) => void,
    editable?: boolean
}) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        editable: editable, // <-- Átadjuk a Tiptapnak
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none p-3 text-foreground prose-strong:text-foreground prose-p:text-foreground prose-headings:text-foreground prose-li:text-foreground ${editable ? 'min-h-[120px]' : ''}`,
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    // Ha menet közben változik a jogosultság, frissítjük az editort
    useEffect(() => {
        if (editor) editor.setEditable(editable)
    }, [editor, editable])

    if (!editor) return null

    return (
        <div className={`flex flex-col w-full bg-background rounded-md transition-all ${editable ? 'border border-border shadow-sm focus-within:ring-2 focus-within:ring-primary/50' : 'border-none'}`}>
            
            {/* ESZKÖZTÁR: Csak akkor mutatjuk, ha szerkeszthető! */}
            {editable && (
                <div className="flex items-center gap-1 bg-sona-neutral/5 p-1 border-b border-border rounded-t-md">
                    <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-sona-neutral/10 transition-colors ${editor.isActive('bold') ? 'bg-primary/20 text-primary' : 'text-sona-neutral'}`}><Bold className="w-4 h-4" /></button>
                    <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-sona-neutral/10 transition-colors ${editor.isActive('italic') ? 'bg-primary/20 text-primary' : 'text-sona-neutral'}`}><Italic className="w-4 h-4" /></button>
                    <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1.5 rounded hover:bg-sona-neutral/10 transition-colors ${editor.isActive('strike') ? 'bg-primary/20 text-primary' : 'text-sona-neutral'}`}><Strikethrough className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-sona-neutral/10 transition-colors ${editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : 'text-sona-neutral'}`}><List className="w-4 h-4" /></button>
                    <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded hover:bg-sona-neutral/10 transition-colors ${editor.isActive('orderedList') ? 'bg-primary/20 text-primary' : 'text-sona-neutral'}`}><ListOrdered className="w-4 h-4" /></button>
                </div>
            )}

            <div className={`cursor-text ${!editable && 'opacity-90'}`} onClick={() => editable && editor.commands.focus()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}