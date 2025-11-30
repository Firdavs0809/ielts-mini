'use client';

import { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Question } from '@/types';
import { cn } from '@/lib/utils';

interface DragDropMatchingProps {
  question: Question;
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
  showCorrectAnswer?: boolean;
}

/**
 * Drag and Drop Matching component
 * For Matching and Headings question types
 */
export default function DragDropMatching({
  question,
  selectedAnswer,
  onAnswerChange,
  showCorrectAnswer = false,
}: DragDropMatchingProps) {
  // Parse options from question.options_data or question.options
  const options = question.options_data || {};
  const items = options.items || [];
  const targets = options.targets || [];

  const [matches, setMatches] = useState<Record<string, string>>(
    selectedAnswer ? JSON.parse(selectedAnswer) : {}
  );

  const handleDrop = (targetId: string, itemId: string) => {
    const newMatches = { ...matches, [targetId]: itemId };
    setMatches(newMatches);
    onAnswerChange(JSON.stringify(newMatches));
  };

  return (
    <div className="space-y-6">
      {/* Items to drag */}
      <div>
        <h4 className="font-medium mb-3 text-gray-700">Options:</h4>
        <div className="flex flex-wrap gap-2">
          {items.map((item: any) => (
            <DraggableItem
              key={item.id}
              item={item}
              isUsed={Object.values(matches).includes(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Drop targets */}
      <div>
        <h4 className="font-medium mb-3 text-gray-700">Match to:</h4>
        <div className="space-y-2">
          {targets.map((target: any) => (
            <DroppableTarget
              key={target.id}
              target={target}
              matchedItem={items.find((i: any) => i.id === matches[target.id])}
              onDrop={(itemId) => handleDrop(target.id, itemId)}
              showCorrectAnswer={showCorrectAnswer}
              correctAnswer={question.correct_answer}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Draggable Item Component
function DraggableItem({ item, isUsed }: { item: any; isUsed: boolean }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'match-item',
    item: { id: item.id },
    canDrag: !isUsed,
  });

  return (
    <div
      ref={drag}
      className={cn(
        'px-4 py-2 border-2 rounded-lg cursor-move transition-all',
        {
          'border-gray-300 bg-white hover:bg-gray-50': !isUsed,
          'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed': isUsed,
          'opacity-50': isDragging,
        }
      )}
    >
      {item.label || item.text}
    </div>
  );
}

// Droppable Target Component
function DroppableTarget({
  target,
  matchedItem,
  onDrop,
  showCorrectAnswer,
  correctAnswer,
}: {
  target: any;
  matchedItem: any;
  onDrop: (itemId: string) => void;
  showCorrectAnswer: boolean;
  correctAnswer: string;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: 'match-item',
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={cn(
        'p-4 border-2 rounded-lg min-h-[60px] flex items-center',
        {
          'border-blue-300 bg-blue-50': isOver,
          'border-gray-300 bg-white': !isOver,
        }
      )}
    >
      <div className="flex-1">
        <span className="font-medium">{target.label || target.text}</span>
        {matchedItem && (
          <div className="mt-2 px-3 py-1 bg-blue-100 rounded inline-block">
            {matchedItem.label || matchedItem.text}
          </div>
        )}
      </div>
    </div>
  );
}

