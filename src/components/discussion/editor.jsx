'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useCallback } from 'react';

// Import các ngôn ngữ phổ biến
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import json from 'highlight.js/lib/languages/json';

// ✅ Tạo instance lowlight đúng cách
const lowlight = createLowlight();

// ✅ Đăng ký các ngôn ngữ sau khi tạo lowlight
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('json', json);

export default function Editor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
      }),
    ],
    editorProps: {
      attributes: {
        class: 'focus:outline-none focus:border-none',
      },
    },
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
        // Set immediatelyRender to false to avoid hydration mismatches
        immediatelyRender: false
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded hover:bg-gray-200 mr-1 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded hover:bg-gray-200 mr-1 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1 rounded hover:bg-gray-200 mr-1 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
          title="Strike"
        >
          <span className="line-through">S</span>
        </button>
        <span className="mx-1 text-gray-300">|</span>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1 rounded hover:bg-gray-200 mr-1 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
          title="Heading 1"
        >
          <span className="font-bold">H1</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1 rounded hover:bg-gray-200 mr-1 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
          title="Heading 2"
        >
          <span className="font-bold">H2</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1 rounded hover:bg-gray-200 mr-1 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
          title="Heading 3"
        >
          <span className="font-bold">H3</span>
        </button>
        <span className="mx-1 text-gray-300">|</span>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded hover:bg-gray-200 mr-1 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          title="Bullet List"
        >
          <span>•</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded hover:bg-gray-200 mr-1 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          title="Ordered List"
        >
          <span>1.</span>
        </button>
        <span className="mx-1 text-gray-300">|</span>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1 rounded hover:bg-gray-200 mr-1 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
          title="Code Block"
        >
          <span className="font-mono">{'{ }'}</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1 rounded hover:bg-gray-200 mr-1 ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
          title="Inline Code"
        >
          <span className="font-mono">`</span>
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`p-1 rounded hover:bg-gray-200 mr-1 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
          title="Link"
        >
          <span className="underline">Link</span>
        </button>
        <span className="mx-1 text-gray-300">|</span>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-1 rounded hover:bg-gray-200 mr-1"
          title="Undo"
          disabled={!editor.can().undo()}
        >
          ↩
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-1 rounded hover:bg-gray-200 mr-1"
          title="Redo"
          disabled={!editor.can().redo()}
        >
          ↪
        </button>
      </div>
      <EditorContent 
        editor={editor} 
        className="prose max-w-full h-full p-4 min-h-62 focus:outline-none" 
      />
    </div>
  );
}