"use client";

import React from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  X,
  ShoppingCart,
  Crown
} from "lucide-react";
import { usePlayerStore, useCartStore } from "@/store/useStore";

export const AudioFloatingPlayer: React.FC = () => {
  const { currentProduct, isPlaying, progress, stopSample, toggleSample } = usePlayerStore();
  const { addItem } = useCartStore();

  if (!currentProduct) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[460px] z-40 animate-in slide-in-from-bottom duration-300">
      <div className="glass-panel bg-[#121212]/95 backdrop-blur-xl border border-[#d47217]/25 rounded-2xl p-3.5 shadow-2xl text-[#FFFFFF] shadow-[#d47217]/15">
        {/* Top Progress Track */}
        <div className="w-full h-1 bg-[#3F3F46] rounded-full overflow-hidden mb-2.5">
          <div
            className="h-full bg-gradient-to-r from-[#d47217] via-[#d47217] to-[#d47217] transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#27272A] border border-[#52525B] flex-shrink-0">
            <Image
              src={currentProduct.images[0]}
              alt={currentProduct.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>

          {/* Title & Tone Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#d47217]">
              <Crown className="w-3 h-3 text-[#d47217]" />
              <span>Audición Zona Audio • {currentProduct.brand}</span>
            </div>
            <h4 className="text-xs font-bold text-[#FFFFFF] truncate">
              {currentProduct.name}
            </h4>
            <p className="text-[11px] text-[#e3deda] truncate">
              {currentProduct.soundDemo.notesDescription}
            </p>
          </div>

          {/* Equalizer Visualizer Bars in Warm Tones */}
          <div className="flex items-end gap-1 h-5 px-1">
            <span
              className={`w-1 rounded-full bg-[#d47217] ${
                isPlaying ? "animate-bar-1" : "h-1"
              }`}
            />
            <span
              className={`w-1 rounded-full bg-[#d47217] ${
                isPlaying ? "animate-bar-2" : "h-2"
              }`}
            />
            <span
              className={`w-1 rounded-full bg-[#d47217] ${
                isPlaying ? "animate-bar-3" : "h-1.5"
              }`}
            />
            <span
              className={`w-1 rounded-full bg-[#d47217] ${
                isPlaying ? "animate-bar-4" : "h-1"
              }`}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleSample(currentProduct)}
              title={isPlaying ? "Pausar muestra de audio" : "Reproducir muestra de audio"}
              aria-label={isPlaying ? "Pausar muestra de audio" : "Reproducir muestra de audio"}
              className="p-2 rounded-xl bg-[#d47217] text-white font-black hover:bg-[#d47217] transition-colors cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={() => addItem(currentProduct, 1)}
              title="Añadir al carrito"
              aria-label="Añadir al carrito"
              className="p-2 rounded-xl bg-[#27272A] hover:bg-[#27272A] text-[#FFFFFF] border border-[#52525B] transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={stopSample}
              title="Cerrar reproductor de audio"
              aria-label="Cerrar reproductor de audio"
              className="p-1.5 text-[#e3deda] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
