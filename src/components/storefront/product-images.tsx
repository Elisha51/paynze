
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Product, ProductVariant } from '@/lib/types';

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
        <div className="grid gap-4">
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="relative aspect-square w-full">
                        <Image
                            src={mainImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => {
                     const imageUrl = (image as { url: string }).url || URL.createObjectURL(image as File);
                     return (
                        <button
                            key={index}
                            onClick={() => setMainImage(imageUrl)}
                            className={cn(
                                'relative aspect-square w-full rounded-md overflow-hidden border-2',
                                mainImage === imageUrl ? 'border-primary' : 'border-transparent'
                            )}
                        >
                            <Image
                                src={imageUrl}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
