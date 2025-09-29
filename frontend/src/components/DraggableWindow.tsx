import { Portal } from '@mantine/core';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

interface DesktopWindowProps {
  opened: boolean;
  onClose: () => void;
  children: ReactNode;
  windowId?: string;
  title?: string;
  defaultPosition?: { x: number; y: number };
  bounds?: 'parent' | 'body' | string;
  disabled?: boolean;
  width?: number | string;
  height?: number | string;
  zIndex?: number;
  resizable?: boolean;
}

export function DraggableWindow({
  opened,
  onClose,
  children,
  windowId: _windowId,
  title = 'Window',
  defaultPosition = { x: 100, y: 100 },
  bounds: _bounds = 'body',
  disabled: _disabled = false,
  width = 1000,
  height = 700,
  zIndex: _zIndex = 1000,
  resizable = true,
}: DesktopWindowProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [_isResizing, setIsResizing] = useState(false);
  const [windowSize, setWindowSize] = useState({ width, height });
  const [position, setPosition] = useState(defaultPosition);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // console.log('DesktopWindow rendering:', { opened, title, defaultPosition, zIndex });

  // Custom drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.window-header')) {
      setIsDragging(true);
      const rect = nodeRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - Number(dragOffset.x);
        const newY = e.clientY - Number(dragOffset.y);

        // Keep window within viewport bounds
        const maxX = window.innerWidth - Number(windowSize.width);
        const maxY = window.innerHeight - Number(windowSize.height);

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    },
    [isDragging, dragOffset, windowSize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle escape key to close window
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && opened) {
        onClose();
      }
    };

    if (opened) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [opened, onClose]);

  if (!opened) {
    return null;
  }

  // Debug log
  // console.log('DesktopWindow rendering:', { opened, title, defaultPosition, zIndex });

  const handleResize = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!resizable) {
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowSize.width;
    const startHeight = windowSize.height;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(400, Number(startWidth) + (e.clientX - startX));
      const newHeight = Math.max(300, Number(startHeight) + (e.clientY - startY));
      setWindowSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    setIsResizing(true);
  };

  return (
    <Portal target={document.body}>
      {/* Draggable Window */}
      <div
        ref={nodeRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="window-title"
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: position.y,
          left: position.x,
          width: windowSize.width,
          height: windowSize.height,
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #d1d5db',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'default',
          minWidth: 400,
          minHeight: 300,
        }}>
        {/* Window Header */}
        <div
          className="window-header"
          onMouseDown={handleMouseDown}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              handleMouseDown(e as any);
            }
          }}
          style={{
            height: '40px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            cursor: 'move',
            userSelect: 'none',
          }}>
          {/* Window Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: 1,
              minWidth: 0,
            }}>
            <div
              id="window-title"
              style={{
                marginLeft: '12px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
              {title}
            </div>
          </div>

          {/* Window Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
            <button
              type="button"
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#6b7280',
                border: 'none',
              }}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#6b7280';
              }}>
              ×
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
          {children}
        </div>

        {/* Resize Handle */}
        {resizable && (
          <button
            type="button"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '20px',
              height: '20px',
              cursor: 'nw-resize',
              background:
                'linear-gradient(-45deg, transparent 0%, transparent 30%, #d1d5db 30%, #d1d5db 35%, transparent 35%, transparent 65%, #d1d5db 65%, #d1d5db 70%, transparent 70%)',
              border: 'none',
              padding: 0,
            }}
            onMouseDown={handleResize}
          />
        )}
      </div>
    </Portal>
  );
}
