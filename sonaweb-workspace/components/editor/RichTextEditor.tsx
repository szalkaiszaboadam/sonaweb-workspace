// components/editor/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter, 
  Code, Link2, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, CheckSquare, Quote, Terminal, Undo, Redo 
} from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Írjon ide..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-sona underline hover:text-sona-hover transition-colors" } }),
      TaskList.configure({ HTMLAttributes: { class: "not-prose pl-2" } }),
      TaskItem.configure({ nested: true, HTMLAttributes: { class: "flex items-start gap-2 my-1" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[140px] max-h-[600px] overflow-y-auto focus:outline-none bg-[#0a0a0a] rounded-xl p-4 border border-neutral-800 focus:border-sona transition-all text-sm text-neutral-200 custom-editor",
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  // Link hozzáadása felugró ablakkal
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL megadása:", previousUrl);

    // Ha visszavonta
    if (url === null) return;

    // Ha üresre hagyta, töröljük a linket
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Link beállítása
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

 const MenuButton = ({ onClick, isActive, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
        isActive 
          ? "bg-sona/10 text-sona shadow-sm shadow-sona/5" 
          : "bg-transparent text-neutral-400 hover:bg-[#222222] hover:text-neutral-200"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-[1px] h-4 bg-neutral-800 mx-1" />;

  return (
    <div className="space-y-2 flex flex-col">
      {/* Eszköztár csoportos sortöréssel (wrap), görgetés nélkül */}
      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-1 px-2 py-1.5 bg-[#111111] rounded-xl border border-neutral-800 shadow-sm">
        
        {/* 1. Csoport: Szövegformázás */}
        <div className="flex items-center gap-0.5">
          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Félkövér">
            <Bold className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Dőlt">
            <Italic className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Aláhúzott">
            <UnderlineIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Áthúzott">
            <Strikethrough className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive("highlight")} title="Kiemelés">
            <Highlighter className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={setLink} isActive={editor.isActive("link")} title="Hivatkozás (Link)">
            <Link2 className="h-4 w-4" />
          </MenuButton>
        </div>

        <Divider />

        {/* 2. Csoport: Igazítások */}
        <div className="flex items-center gap-0.5">
          <MenuButton onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} title="Balra zárt">
            <AlignLeft className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} title="Középre zárt">
            <AlignCenter className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} title="Jobbra zárt">
            <AlignRight className="h-4 w-4" />
          </MenuButton>
        </div>

        <Divider />

        {/* 3. Csoport: Listák */}
        <div className="flex items-center gap-0.5">
          <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Pontozott lista">
            <List className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Számozott lista">
            <ListOrdered className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive("taskList")} title="Teendőlista (Checklist)">
            <CheckSquare className="h-4 w-4" />
          </MenuButton>
        </div>
        
        <Divider />

        {/* 4. Csoport: Blokkok (Kód, Idézet) */}
        <div className="flex items-center gap-0.5">
          <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} title="Inline Kód">
            <Code className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} title="Kódblokk">
            <Terminal className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Idézet block">
            <Quote className="h-4 w-4" />
          </MenuButton>
        </div>

        <Divider />
        
        {/* 5. Csoport: Visszavonás / Ismétlés */}
        <div className="flex items-center gap-0.5">
          <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Visszavonás">
            <Undo className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Ismétlés">
            <Redo className="h-4 w-4" />
          </MenuButton>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}