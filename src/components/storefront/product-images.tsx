

'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Product, ProductVariant } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

interface ProductImagesProps {
    product: Product;
    selectedVariant: ProductVariant | null;
}

export function ProductImages({ product, selectedVariant }: ProductImagesProps) {
    const [mainImage, setMainImage] = useState((product.images[0] as { url: string })?.url || `https://picsum.photos/seed/${product.sku}/600/600`);

    useEffect(() => {
        if (selectedVariant?.imageIds && selectedVariant.imageIds.length > 0) {
            const variantImageId = selectedVariant.imageIds[0];
            const image = product.images.find(img => (img as { id: string }).id === variantImageId);
            if (image && 'url' in image) {
                setMainImage(image.url);
            }
        } else if (product.images.length > 0) {
            setMainImage((product.images[0] as { url: string }).url || `https://picsum.photos/seed/${product.sku}/600/600`);
        }
    }, [selectedVariant, product]);

    return (
        <div className="grid grid-cols-5 gap-4 sticky top-24">
            <div className="col-span-1">
                 <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
                    <div className="flex flex-col gap-2">
                        {product.images.map((image, index) => {
                            const imageUrl = (image as { url: string }).url || URL.createObjectURL(image as File);
                            return (
                                <button
                                    key={index}
                                    onClick={() => setMainImage(imageUrl)}
                                    className={cn(
                                        'relative aspect-square w-full rounded-md overflow-hidden border-2 transition-colors',
                                        mainImage === imageUrl ? 'border-primary' : 'border-transparent hover:border-muted'
                                    )}
                                >
                                    <Image
                                        src={imageUrl}
                                        alt={`Thumbnail ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover"
                                    />
                                </button>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>
            <div className="col-span-4">
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="relative aspect-square w-full">
                            <Image
                                src={mainImage}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-contain"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
