import React, { useState, useEffect, useCallback } from 'react';

function isImage(url = '') {
    return /\.(jpe?g|png|gif|webp|bmp|avif)$/i.test(url);
}

function isVideo(url = '') {
    return /\.(mp4|webm|ogg|ogv|mov|m4v)$/i.test(url);
}

export default function MediaThumb({ src, className = '' }) {
    const [open, setOpen] = useState(false);
    const close = useCallback(() => setOpen(false), []);

    // Cerrar con ESC
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && close();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, close]);

    if (!src) return null;

    const img = isImage(src);
    const vid = isVideo(src);

    // Si no es imagen ni video, muestro el texto truncado como link
    if (!img && !vid) {
        return (
            <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className={`truncate block text-blue-600 hover:underline ${className}`}
                title={src}
            >
                {src}
            </a>
        );
    }

    return (
        <div className={className}>
            {/* Miniatura */}
            {img ? (
                <img
                    src={src}
                    alt="Miniatura"
                    className="w-16 h-16 object-cover rounded cursor-pointer border border-slate-200"
                    onClick={() => setOpen(true)}
                    loading="lazy"
                />
            ) : (
                <video
                    src={src}
                    className="w-24 h-16 rounded object-cover cursor-pointer border border-slate-200"
                    muted
                    onClick={() => setOpen(true)}
                />
            )}

            {/* Modal */}
            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                    onClick={close}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-500 truncate pr-2">{src}</span>
                            <button
                                className="px-2 py-1 rounded text-slate-700 hover:bg-slate-100"
                                onClick={close}
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex items-center justify-center">
                            {img ? (
                                <img
                                    src={src}
                                    alt="Vista completa"
                                    className="max-w-full max-h-[80vh] rounded"
                                />
                            ) : (
                                <video
                                    src={src}
                                    className="max-w-full max-h-[80vh] rounded"
                                    controls
                                    autoPlay
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
