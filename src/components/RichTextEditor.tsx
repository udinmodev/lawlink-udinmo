import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { supabase, type Profile } from '../lib/supabase';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

interface SuggestionProps {
  query: string;
  items: Profile[];
  command: (item: Profile) => void;
}

const MentionList = ({ items, command, query }: SuggestionProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {items.length ? (
        items.map((item, index) => (
          <button
            key={index}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
            onClick={() => command(item)}
          >
            {item.avatar_url ? (
              <img
                src={item.avatar_url}
                alt={item.username}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {item.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-medium">{item.full_name || item.username}</div>
              <div className="text-sm text-gray-500">@{item.username}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-4 py-2 text-sm text-gray-500">No results</div>
      )}
    </div>
  );
};

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  onMention?: (userId: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Write something...',
  minHeight = '100px',
  onMention,
}) => {
  const getSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) return [];
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `${query}%`)
      .limit(5);

    if (error) {
      console.error('Error fetching mentions:', error);
      return [];
    }

    return data || [];
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-500 hover:underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: async ({ query }) => getSuggestions(query),
          render: () => {
            let component: any;
            let popup: any;

            return {
              onStart: (props) => {
                component = new MentionList(props);
                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                });
              },
              onUpdate: (props) => {
                component.updateProps(props);
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                });
              },
              onKeyDown: (props) => {
                if (props.event.key === 'Escape') {
                  popup[0].hide();
                  return true;
                }
                return component.onKeyDown(props);
              },
              onExit: () => {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
          onSelect: ({ item }) => {
            onMention?.(item.id);
            return {
              id: item.id,
              label: `@${item.username}`,
            };
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div 
      className="prose prose-sm max-w-none border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500"
      style={{ minHeight }}
    >
      <style>{`
        .mention {
          color: #3b82f6;
          font-weight: 500;
        }
        .ProseMirror {
          min-height: ${minHeight};
          padding: 0.75rem;
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;