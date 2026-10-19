import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCategory } from '@/types';
import { OptimizedImage } from './OptimizedImage';

export interface CategoryCardProps {
  category: ProductCategory;
  featured?: boolean;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  featured = false,
  className = '',
}) => {
  return (
    <article
      className={`group bg-white border border-[#D8D5CB] rounded-md overflow-hidden flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-elevated hover:border-[#246B45] ${
        featured ? 'md:col-span-2 md:flex-row' : ''
      } ${className}`}
    >
      {/* Category Image */}
      <div
        className={`relative overflow-hidden ${
          featured ? 'md:w-1/2 min-h-[220px]' : 'w-full'
        }`}
      >
        <OptimizedImage
          src={category.image}
          alt={category.imageAlt}
          aspectRatio={featured ? 'wide' : 'landscape'}
          category={category.name}
          fallbackLabel={category.name}
          provisionalNote="Provisional Classification"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {category.badge && (
          <div className="absolute top-3 right-3 z-10">
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/90 text-[#3A403C] backdrop-blur-xs px-2.5 py-1 rounded border border-[#D8D5CB]">
              {category.badge}
            </span>
          </div>
        )}
      </div>

      {/* Category Text & Actions */}
      <div
        className={`p-6 flex flex-col justify-between flex-1 ${
          featured ? 'md:w-1/2 md:p-8' : ''
        }`}
      >
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#246B45] block mb-1.5">
            Packaging Category
          </span>
          <h3 className="text-xl font-bold text-[#252A27] tracking-tight group-hover:text-[#246B45] transition-colors">
            <Link
              to="/products"
              className="focus-visible:outline-2 focus-visible:outline-[#246B45] focus-visible:outline-offset-2 rounded"
            >
              {category.name}
            </Link>
          </h3>
          <p className="mt-2.5 text-xs sm:text-sm text-[#5C635F] leading-relaxed">
            {category.shortDescription}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E6E4DD] flex items-center justify-between">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#246B45] group-hover:text-[#1D5838] transition-colors group-hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <span className="text-[11px] text-[#88918C]">Sample Range</span>
        </div>
      </div>
    </article>
  );
};
