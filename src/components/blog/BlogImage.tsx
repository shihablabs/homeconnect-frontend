"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface BlogImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

export function BlogImage({ src, alt, fallbackSrc = "/placeholder-property.jpg", ...props }: BlogImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
}
