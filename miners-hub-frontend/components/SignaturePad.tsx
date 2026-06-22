import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface SignaturePadHandles {
  toDataURL: () => string;
  clear: () => void;
}

const SignaturePad = forwardRef<SignaturePadHandles>((props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);

    const getCanvasContext = () => {
        return canvasRef.current?.getContext('2d') || null;
    };
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = getCanvasContext();
        if(!ctx) return;

        const setCanvasStyle = () => {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            ctx.scale(ratio, ratio);

            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary-rgb').trim();
            ctx.strokeStyle = `rgb(${textColor})`;
            
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        };
        
        setCanvasStyle();
        window.addEventListener('resize', setCanvasStyle);

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    // Re-apply styles if theme changes
                    setCanvasStyle();
                }
            }
        });
        observer.observe(document.documentElement, { attributes: true });
        
        return () => {
            window.removeEventListener('resize', setCanvasStyle);
            observer.disconnect();
        };
    }, []);
    
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const ctx = getCanvasContext();
        if (!ctx) return;
        const pos = getMousePos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        isDrawing.current = true;
    };
    
    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing.current) return;
        const ctx = getCanvasContext();
        if (!ctx) return;
        const pos = getMousePos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const ctx = getCanvasContext();
        if (!ctx) return;
        ctx.closePath();
        isDrawing.current = false;
    };

    const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };
    
    useImperativeHandle(ref, () => ({
        toDataURL: () => {
            return canvasRef.current?.toDataURL('image/png') || '';
        },
        clear: () => {
            const canvas = canvasRef.current;
            const ctx = getCanvasContext();
            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }));
    
    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full bg-primary border border-border rounded-md"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        />
    );
});

export default SignaturePad;
