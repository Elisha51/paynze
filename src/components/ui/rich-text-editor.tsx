'use client';

import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Code, Maximize, Minimize, Eye } from 'lucide-react';
import { Textarea } from './textarea';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { cn } from '@/lib/utils';
import { Remarkable } from 'remarkable';

interface RichTextEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const md = new Remarkable();

export function RichTextEditor({ id, value, onChange, placeholder }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const applyFormat = (formatType: 'bold' | 'italic' | 'ul' | 'ol' | 'code') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = internalValue.substring(start, end);
    let newText;

    switch (formatType) {
      case 'bold':
        newText = `${internalValue.substring(0, start)}**${selectedText}**${internalValue.substring(end)}`;
        break;
      case 'italic':
        newText = `${internalValue.substring(0, start)}*${selectedText}*${internalValue.substring(end)}`;
        break;
      case 'ul':
        const listItems = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        newText = `${internalValue.substring(0, start)}${listItems}${internalValue.substring(end)}`;
        break;
      case 'ol':
        const orderedItems = selectedText.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n');
        newText = `${internalValue.substring(0, start)}${orderedItems}${internalValue.substring(end)}`;
        break;
      case 'code':
        newText = `${internalValue.substring(0, start)}\`\`\`\n${selectedText}\n\`\`\`${internalValue.substring(end)}`;
        break;
      default:
        newText = internalValue;
    }
    setInternalValue(newText);
    onChange(newText);
    textarea.focus();
  };
  
  const handleSaveChanges = () => {
    onChange(internalValue);
    setIsExpanded(false);
  }

  const editor = (isDialog: boolean) => (
    <div className={cn("border rounded-md", isDialog ? "h-full flex flex-col" : "")}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-1">
             <TabsList className="grid grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <Button variant="ghost" size="icon" type="button" onClick={() => applyFormat('bold')} aria-label="Bold"><Bold className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" type="button" onClick={() => applyFormat('italic')} aria-label="Italic"><Italic className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" type="button" onClick={() => applyFormat('ul')} aria-label="Bulleted List"><List className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" type="button" onClick={() => applyFormat('ol')} aria-label="Numbered List"><ListOrdered className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" type="button" onClick={() => applyFormat('code')} aria-label="Code"><Code className="h-4 w-4" /></Button>
          </div>
          <Button variant="ghost" size="icon" type="button" onClick={() => setIsExpanded(!isExpanded)} aria-label="Expand editor">
            {isDialog ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
        <TabsContent value="edit" className={cn("m-0", isDialog ? "flex-1" : "")}>
          <Textarea
            id={id}
            ref={textareaRef}
            value={internalValue}
            onChange={(e) => {
                setInternalValue(e.target.value);
                if(!isDialog) onChange(e.target.value);
            }}
            placeholder={placeholder}
            className={cn("border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none p-3", isDialog ? "h-full" : "min-h-[150px]")}
          />
        </TabsContent>
        <TabsContent value="preview" className="m-0 p-3">
          <div 
            className={cn("prose prose-sm", isDialog ? "h-[calc(100vh-200px)] overflow-y-auto" : "min-h-[150px]")}
            dangerouslySetInnerHTML={{ __html: md.render(internalValue) }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <>
      {editor(false)}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl h-[calc(100vh-4rem)] flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Edit Detailed Description</DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-4 min-h-0">
            {editor(true)}
          </div>
          <DialogFooter className="p-4 border-t">
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveChanges}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
