import React from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

export interface RelatedProductsProps {
  currentProduct: Product;
  allProducts: Product[];
  className?: string;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  currentProduct,
  allProducts,
  className = '',
}) => {
  // 1. Try to find products in the same category (excluding current)
  const sameCategoryProducts = allProducts.filter(
    (p) => p.id !== currentProduct.id && p.categoryId === currentProduct.categoryId
  );

  // 2. If fewer than 3, backfill with other products
  let related = [...sameCategoryProducts];
  if (related.length < 3) {
    const otherProducts = allProducts.filter(
      (p) => p.id !== currentProduct.id && p.categoryId !== currentProduct.categoryId
    );
    related = [...related, ...otherProducts].slice(0, 3);
  } else {
    related = related.slice(0, 3);
  }

  if (related.length === 0) {
    return null;
  }

  return (
    <section className={`space-y-6 pt-10 border-t border-[#E6E4DD] ${className}`} aria-labelledby="related-products-heading">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
            Explore More
          </span>
          <h2 id="related-products-heading" className="text-2xl font-bold tracking-tight text-[#252A27]">
            Related Packaging Products
          </h2>
        </div>
        <p className="text-xs text-[#5C635F]">
          Complementary packaging formats and specifications
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {related.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </section>
  );
};
