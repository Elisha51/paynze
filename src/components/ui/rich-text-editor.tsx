
'use client';

import { useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';
import { Textarea } from './textarea';
import { Button } from './button';

interface RichTextEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ id, value, onChange, placeholder }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (formatType: 'bold' | 'italic' | 'underline' | 'ul' | 'ol') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText;

    switch (formatType) {
      case 'bold':
        newText = `${value.substring(0, start)}**${selectedText}**${value.substring(end)}`;
        onChange(newText);
        break;
      case 'italic':
        newText = `${value.substring(0, start)}*${selectedText}*${value.substring(end)}`;
        onChange(newText);
        break;
      case 'ul':
        const listItems = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        newText = `${value.substring(0, start)}${listItems}${value.substring(end)}`;
        onChange(newText);
        break;
      case 'ol':
        const orderedItems = selectedText.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n');
        newText = `${value.substring(0, start)}${orderedItems}${value.substring(end)}`;
        onChange(newText);
        break;
    }
    
    // Focus and adjust cursor position after change
    textarea.focus();
  };

  return (
    <div className="border rounded-md">
      <div className="flex items-center gap-1 p-2 border-b">
        <Button variant="ghost" size="icon" type="button" onClick={() => applyFormat('bold')} aria-label="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={() => applyFormat('ul')} aria-label="Bulleted List">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={() => applyFormat('ol')} aria-label="Numbered List">
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        id={id}
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[150px]"
      />
    </div>
  );
}
