"use client";

import { PropertyImageLightbox } from "@/components/PropertyImageLightbox";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
}

const SafeImage = (props: ImageProps) => {
  const [src, setSrc] = useState(props.src);

  return (
    <Image
      {...props}
      src={src}
      onError={() => setSrc("/placeholder-property.jpg")}
    />
  );
};

export function PropertyImageGallery({
  images,
  title,
}: PropertyImageGalleryProps) {
  const placeholderImage = "/placeholder-property.jpg";
  const getSrc = (src?: string) =>
    src && src.length > 0 ? src : placeholderImage;

  const [image1, image2, image3, image4, image5] = images || [];
  const [index, setIndex] = useState(-1);

  const handleImageClick = (clickedIndex: number) => {
    setIndex(clickedIndex);
  };

  return (
    <>
      <div className="relative h-[450px] w-full overflow-hidden rounded-xl">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full">
          {}
          <div
            className="col-span-4 row-span-2 lg:col-span-2 h-full relative cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => handleImageClick(0)}
          >
            <SafeImage
              src={getSrc(image1)}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {}
          <div className="hidden lg:block col-span-1 row-span-1 relative cursor-pointer hover:opacity-95 transition-opacity" onClick={() => handleImageClick(1)}>
            <SafeImage src={getSrc(image2)} alt={title} fill className="object-cover" />
          </div>
          <div className="hidden lg:block col-span-1 row-span-1 relative cursor-pointer hover:opacity-95 transition-opacity" onClick={() => handleImageClick(2)}>
            <SafeImage src={getSrc(image3)} alt={title} fill className="object-cover" />
          </div>
          <div className="hidden lg:block col-span-1 row-span-1 relative cursor-pointer hover:opacity-95 transition-opacity" onClick={() => handleImageClick(3)}>
            <SafeImage src={getSrc(image4)} alt={title} fill className="object-cover" />
          </div>
          <div className="hidden lg:block col-span-1 row-span-1 relative cursor-pointer hover:opacity-95 transition-opacity" onClick={() => handleImageClick(4)}>
            <SafeImage src={getSrc(image5)} alt={title} fill className="object-cover" />
          </div>
        </div>

        <Button
          variant="secondary"
          className="absolute bottom-4 right-4 shadow-md bg-white/90 hover:bg-white text-black"
          onClick={() => handleImageClick(0)}
        >
          <Camera className="mr-2 h-4 w-4" />
          Show all photos
        </Button>
      </div>

      <PropertyImageLightbox
        images={images}
        index={index}
        open={index >= 0}
        close={() => setIndex(-1)}
        setIndex={setIndex}
      />
    </>
  );
}