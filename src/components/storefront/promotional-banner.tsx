
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface PromotionalBannerProps {
  image: ImagePlaceholder;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

export function PromotionalBanner({ image, title, description, ctaText, ctaLink }: PromotionalBannerProps) {
  return (
    <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden my-8">
      <Image
        src={image.imageUrl}
        alt={image.description}
        fill
        className="object-cover"
        data-ai-hint={image.imageHint}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
      <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-12 text-white">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight">{title}</h2>
        <p className="mt-2 text-md md:text-lg max-w-lg">{description}</p>
        <Button asChild className="mt-4" size="lg">
          <Link href={ctaLink}>{ctaText}</Link>
        </Button>
      </div>
    </div>
  );
}
