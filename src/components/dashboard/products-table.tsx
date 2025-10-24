import Image from 'next/image';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { products } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function ProductsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell">
            <span className="sr-only">Image</span>
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Price (UGX)</TableHead>
          <TableHead className="hidden md:table-cell">Stock</TableHead>
          <TableHead className="hidden md:table-cell">Category</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const image = PlaceHolderImages.find((p) => p.id === product.imageId);
          return (
            <TableRow key={product.id}>
              <TableCell className="hidden sm:table-cell">
                {image && (
                  <Image
                    alt={product.name}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={image.imageUrl}
                    width="64"
                    data-ai-hint={image.imageHint}
                  />
                )}
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <Badge variant={product.status === 'draft' ? 'secondary' : 'default'}>
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell>{product.price.toLocaleString()}</TableCell>
              <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
              <TableCell className="hidden md:table-cell">
                {product.category}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
