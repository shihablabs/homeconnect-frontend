"use client";

import { Button } from "@/components/ui/button";
import { clearCompare, removeFromCompare } from "@/redux/features/property/compareSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, LayoutGrid, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function CompareTray() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.compare);

  if (items.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl px-4"
      >
        <div className="bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-2xl rounded-2xl p-4 flex items-center gap-6 overflow-hidden">
          {/* Header Info */}
          <div className="hidden md:flex flex-col shrink-0">
            <div className="flex items-center gap-2 text-primary">
              <LayoutGrid className="h-4 w-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Compare</span>
            </div>
            <span className="text-xs text-gray-500 font-semibold">{items.length} of 3 Selected</span>
          </div>

          {/* Property Thumbnails */}
          <div className="flex-1 flex gap-3 overflow-x-auto no-scrollbar">
            {items.map((item) => (
              <CompareThumbnail key={item.id} item={item} dispatch={dispatch} />
            ))}

            {/* Empty Slots */}
            {Array.from({ length: 3 - items.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-14 w-20 shrink-0 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50/50"
              >
                <span className="text-gray-300 text-[10px] font-bold uppercase tracking-tighter">Add</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <button
              onClick={() => { dispatch(clearCompare()) }}
              className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors px-2 uppercase tracking-wide"
            >
              Clear
            </button>
            <Link href="/properties/compare">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-4 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                <span>Compare Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ... imports

function CompareThumbnail({ item, dispatch }: { item: any, dispatch: any }) {
  const [src, setSrc] = useState(item.images?.[0] || "/placeholder-property.jpg");

  return (
    <div
      className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border-2 border-primary/10 group bg-gray-50"
    >
      <Image
        src={src}
        alt={item.title}
        fill
        className="object-cover"
        onError={() => setSrc("/placeholder-property.jpg")}
      />
      <button
        type="button"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          dispatch(removeFromCompare(item.id));
        }}
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm z-10"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
