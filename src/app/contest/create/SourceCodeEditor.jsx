'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import 'highlight.js/styles/atom-one-dark.css';

// Create a lowlight instance
const lowlight = createLowlight();

// Register languages for syntax highlighting
lowlight.register('javascript', javascript);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('cpp', cpp);

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  // Language options for code blocks
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'text', label: 'Plain Text' },
  ];

  const setLanguage = (language) => {
    editor.chain().focus().setCodeBlock({ language }).run();
  };

  return (
    <div className="menu-bar flex flex-wrap gap-1 p-1 border border-gray-300 mb-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1 rounded ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
        title="Code Block"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      </button>
      {editor.isActive('codeBlock') && (
        <select 
          onChange={(e) => setLanguage(e.target.value)}
          className="text-sm p-1 rounded border"
          value={editor.getAttributes('codeBlock').language || 'text'}
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      )}
      <div className="h-5 w-0.5 bg-gray-300 mx-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        title="Bold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        title="Italic"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="4" x2="10" y2="4"></line>
          <line x1="14" y1="20" x2="5" y2="20"></line>
          <line x1="15" y1="4" x2="9" y2="20"></line>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        title="Bullet List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="9" y1="6" x2="20" y2="6"></line>
          <line x1="9" y1="12" x2="20" y2="12"></line>
          <line x1="9" y1="18" x2="20" y2="18"></line>
          <line x1="5" y1="6" x2="5" y2="6"></line>
          <line x1="5" y1="12" x2="5" y2="12"></line>
          <line x1="5" y1="18" x2="5" y2="18"></line>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="p-1 rounded"
        title="Undo"
        disabled={!editor.can().undo()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6"></path>
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="p-1 rounded"
        title="Redo"
        disabled={!editor.can().redo()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7v6h-6"></path>
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path>
        </svg>
      </button>
    </div>
  );
};

const SourceCodeEditor = ({ value, setValue }) => {
  // Add client-side only initialization
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
    ],
    content: value || '<pre><code class="language-javascript"> //Enter your code here...</code></pre>',
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
    // Set immediatelyRender to false to avoid hydration mismatches
    immediatelyRender: false
  });

  useEffect(() => {
    if (editor && value && value.trim() !== editor.getHTML().trim()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);
  
  // Return placeholder until client-side rendering is ready
  if (!isMounted) {
    return (
      <div className="source-editor-container border border-gray-300 rounded-lg">
        <div className="p-3 min-h-[250px]">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className="source-editor-container border border-gray-300 rounded-lg">
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="p-3 min-h-[250px] prose max-w-none focus:outline-none" 
      />
      <style jsx global>{`
        .ProseMirror {
          min-height: 200px;
          outline: none;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror pre {
          background-color:rgb(255, 255, 255);
          border-radius: 4px;
          color:rgb(0, 0, 0);
        }
        .ProseMirror pre code {
          background: none;
          color: inherit;
          font-size: 0.9em;
          padding: 0;
        }
        .ProseMirror code {
          background-color: #f1f1f1;
          border-radius: 3px;
          padding: 0.2em 0.4em;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        }
      `}</style>
    </div>
  );
};

export default SourceCodeEditor;