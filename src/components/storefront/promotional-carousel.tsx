
'use client';

import * as React from 'react';
import Autoplay from "embla-carousel-autoplay"
import Image from 'next/image';
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
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PromotionalCarouselProps {
    campaigns: Campaign[];
}

export function PromotionalCarousel({ campaigns }: PromotionalCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )
  
  const defaultBannerImage = PlaceHolderImages.find(p => p.id === 'store-banner');

  const sizeClasses = {
      standard: 'aspect-[6/1]',
      large: 'aspect-[4/1]',
      square: 'aspect-[16/9]',
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <Carousel
        plugins={[plugin.current]}
        className="w-full mb-8"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {campaigns.map((campaign) => {
          const bannerSize = campaign.banner?.size || 'standard';
          return (
            <CarouselItem key={campaign.id}>
              <div className={cn("relative w-full rounded-lg overflow-hidden", sizeClasses[bannerSize])}>
                  <Image
                      src={campaign.banner?.imageUrl || defaultBannerImage?.imageUrl || `https://picsum.photos/seed/${campaign.id}/1200/400`}
                      alt={campaign.banner?.title || campaign.name}
                      fill
                      className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
                  <motion.div 
                    className="absolute inset-0 flex flex-col justify-end items-start p-6 md:p-10 text-white"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={contentVariants}
                  >
                      <h2 className="text-xl md:text-3xl font-bold tracking-tight">{campaign.banner?.title}</h2>
                      <p className="mt-1 text-sm md:text-base max-w-lg">{campaign.banner?.description}</p>
                      <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                        <Button asChild className="mt-4" size="lg">
                          <Link href={campaign.banner?.ctaLink || '#'}>{campaign.banner?.ctaText}</Link>
                        </Button>
                      </motion.div>
                  </motion.div>
              </div>
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4"/>
    </Carousel>
  )
}
