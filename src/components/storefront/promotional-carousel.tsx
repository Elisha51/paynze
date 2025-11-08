
'use client';

import * as React from 'react';
import Autoplay from "embla-carousel-autoplay"
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Campaign } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface PromotionalCarouselProps {
    campaigns: Campaign[];
}

export function PromotionalCarousel({ campaigns }: PromotionalCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )
  
  const defaultBannerImage = PlaceHolderImages.find(p => p.id === 'store-banner');

  return (
    <Carousel
        plugins={[plugin.current]}
        className="w-full mb-8"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {campaigns.map((campaign) => (
          <CarouselItem key={campaign.id}>
            <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden">
                <Image
                    src={campaign.banner?.imageUrl || defaultBannerImage?.imageUrl || `https://picsum.photos/seed/${campaign.id}/1200/400`}
                    alt={campaign.banner?.title || campaign.name}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
                <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-12 text-white">
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight">{campaign.banner?.title}</h2>
                    <p className="mt-2 text-md md:text-lg max-w-lg">{campaign.banner?.description}</p>
                    <Button asChild className="mt-4" size="lg">
                    <Link href={campaign.banner?.ctaLink || '#'}>{campaign.banner?.ctaText}</Link>
                    </Button>
                </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4"/>
    </Carousel>
  )
}
