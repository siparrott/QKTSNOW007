import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';

interface EditableTextProps {
  text: string;
  onSave: (newText: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  isPreview?: boolean;
}

export function EditableText({
  text,
  onSave,
  className = '',
  placeholder = 'Click to edit...',
  multiline = false,
  isPreview = false
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(text);
  }, [text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPreview) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isPreview) {
    return <span className={className}>{text}</span>;
  }

  if (isEditing) {
    return (
      <>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={`${className} bg-white border-2 border-blue-400 rounded px-2 py-1 resize-none w-full focus:outline-none focus:border-blue-500`}
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={`${className} bg-white border-2 border-blue-400 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500`}
            placeholder={placeholder}
          />
        )}
      </>
    );
  }

  return (
    <span
      className={`${className} cursor-pointer hover:bg-blue-50 hover:outline hover:outline-2 hover:outline-blue-300 hover:outline-dashed rounded px-1 py-0.5 transition-all relative group`}
      onClick={handleEdit}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Click to edit this text"
    >
      {text || placeholder}
      {isHovered && (
        <Edit2 className="h-3 w-3 absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 opacity-75" />
      )}
    </span>
  );
}