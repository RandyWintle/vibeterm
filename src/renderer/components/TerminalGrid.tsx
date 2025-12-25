import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Terminal from './Terminal';
import { TerminalInstance } from '../App';

interface TerminalGridProps {
    terminals: TerminalInstance[];
    onCloseTerminal: (id: string) => void;
    onReorderTerminals: (terminals: TerminalInstance[]) => void;
}

interface SortableTerminalProps {
    terminal: TerminalInstance;
    onClose: () => void;
    isDragging?: boolean;
}

const SortableTerminal: React.FC<SortableTerminalProps> = ({ terminal, onClose, isDragging }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: terminal.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-base)',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`terminal-container relative rounded-lg overflow-hidden ${isSortableDragging ? 'z-50' : ''}`}
        >
            {/* Terminal header - drag handle */}
            <div
                className="terminal-header cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <div className="terminal-header-title">
                    <span className="text-sm opacity-60">📁</span>
                    <div className="min-w-0">
                        <span
                            className="block text-sm truncate font-medium"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {terminal.name}
                        </span>
                        {terminal.startupCommand && (
                            <span
                                className="block text-xs truncate font-mono"
                                style={{ color: 'var(--accent-muted)' }}
                            >
                                → {terminal.startupCommand}
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="terminal-close-btn"
                    title="Close terminal"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Terminal content */}
            <div className="terminal-inner">
                <Terminal
                    id={terminal.id}
                    cwd={terminal.cwd}
                    startupCommand={terminal.startupCommand}
                />
            </div>
        </div>
    );
};

// Overlay shown while dragging
const DragOverlayContent: React.FC<{ terminal: TerminalInstance }> = ({ terminal }) => {
    return (
        <div
            className="terminal-container relative rounded-lg overflow-hidden shadow-2xl"
            style={{
                border: '2px solid var(--accent)',
                backgroundColor: 'var(--bg-base)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px var(--accent-glow)',
                transform: 'scale(1.02)',
            }}
        >
            <div className="terminal-header cursor-grabbing">
                <div className="terminal-header-title">
                    <span className="text-sm opacity-60">📁</span>
                    <div className="min-w-0">
                        <span
                            className="block text-sm truncate font-medium"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {terminal.name}
                        </span>
                        {terminal.startupCommand && (
                            <span
                                className="block text-xs truncate font-mono"
                                style={{ color: 'var(--accent-muted)' }}
                            >
                                → {terminal.startupCommand}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div
                className="h-32 flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-muted)' }}
            >
                <span className="text-sm">Drop to reorder</span>
            </div>
        </div>
    );
};

const TerminalGrid: React.FC<TerminalGridProps> = ({ terminals, onCloseTerminal, onReorderTerminals }) => {
    const [activeId, setActiveId] = React.useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px of movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Calculate grid columns based on terminal count
    const getGridClass = () => {
        const count = terminals.length;
        if (count === 1) return 'grid-cols-1';
        if (count === 2) return 'grid-cols-2';
        if (count <= 4) return 'grid-cols-2';
        if (count <= 6) return 'grid-cols-3';
        return 'grid-cols-3';
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = terminals.findIndex((t) => t.id === active.id);
            const newIndex = terminals.findIndex((t) => t.id === over.id);
            const newTerminals = arrayMove(terminals, oldIndex, newIndex);
            onReorderTerminals(newTerminals);
        }
    };

    const activeTerminal = activeId ? terminals.find((t) => t.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={terminals.map((t) => t.id)} strategy={rectSortingStrategy}>
                <div className={`flex-1 grid ${getGridClass()} gap-2 p-2 overflow-hidden`}>
                    {terminals.map((terminal) => (
                        <SortableTerminal
                            key={terminal.id}
                            terminal={terminal}
                            onClose={() => onCloseTerminal(terminal.id)}
                        />
                    ))}
                </div>
            </SortableContext>

            <DragOverlay>
                {activeTerminal ? <DragOverlayContent terminal={activeTerminal} /> : null}
            </DragOverlay>
        </DndContext>
    );
};

export default TerminalGrid;
