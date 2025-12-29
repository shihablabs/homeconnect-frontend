"use client";

import Image from "next/image";
import Lightbox, { Slide } from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface PropertyImageLightboxProps {
  images: string[];
  index: number;
  open: boolean;
  close: () => void;
  setIndex: (index: number) => void;
}

export function PropertyImageLightbox({
  images,
  index,
  open,
  close,
  setIndex,
}: PropertyImageLightboxProps) {
  
  const validImages = Array.isArray(images) ? images.filter(Boolean) : [];

  if (validImages.length === 0) return null;

  return (
    <Lightbox
      open={open}
      close={close}
      index={index}
      slides={validImages.map((src) => ({ src }))}
      on={{
        view: ({ index: newIndex }) => setIndex(newIndex),
      }}
      plugins={[Zoom, Thumbnails]}
      render={{
        slide: ({ slide, rect }) => {
          const imageSlide = slide as Slide & { src: string };

          
          
          
          const width = rect.width;
          const height = rect.height;

          return (
            <div style={{ position: "relative", width, height }}>
              <Image
                src={imageSlide.src}
                alt="Property Image"
                fill
                className="object-contain"
                sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
                priority={true}
              />
            </div>
          );
        },
      }}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
      }}
      thumbnails={{
        position: "bottom",
        width: 120,
        height: 80,
        border: 2,
        borderRadius: 4,
        padding: 4,
        gap: 16,
      }}
    />
  );
}
