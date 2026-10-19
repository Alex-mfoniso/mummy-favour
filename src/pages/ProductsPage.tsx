import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronRight, PhoneCall } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { 
  ProductSearch, 
  CategoryNav, 
  ProductSort, 
  ProductFilters, 
  ProductGrid 
} from '@/components/products';
import { PRODUCTS } from '@/data/products';
import { PRODUCT_CATEGORIES } from '@/data/categories';
import { fetchPublicProducts, fetchPublicCategories } from '@/services/productService';
import { Product, ProductCategory, ProductFiltersState, ProductSortOption } from '@/types';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  // Core interactive filter state
  const [filters, setFilters] = useState<ProductFiltersState>({
    category: initialCategory,
    search: '',
    status: 'all',
    customization: 'all',
    sortBy: 'featured',
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync category changes with URL search params cleanly
  const handleCategorySelect = (categoryId: string) => {
    setFilters((prev) => ({ ...prev, category: categoryId }));
    if (categoryId === 'all') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('category');
      setSearchParams(nextParams, { replace: true });
    } else {
      setSearchParams({ category: categoryId }, { replace: true });
    }
  };

  const handleFilterChange = (partial: Partial<ProductFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      search: '',
      status: 'all',
      customization: 'all',
      sortBy: 'featured',
    });
    setSearchParams({}, { replace: true });
  };

  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<ProductCategory[]>(PRODUCT_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    const loadCatalogue = async () => {
      try {
        const [prodRes, cats] = await Promise.all([
          fetchPublicProducts({ limit: 100 }),
          fetchPublicCategories(),
        ]);
        if (isMounted) {
          if (prodRes.products && prodRes.products.length > 0) {
            setProducts(prodRes.products);
          }
          if (cats && cats.length > 0) {
            setCategories(cats);
          }
        }
      } catch (err) {
        console.warn('[ProductsPage] API fetch failed, retaining fallback data:', err);
      }
    };

    loadCatalogue();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute category product counts dynamically
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((prod) => {
      counts[prod.categoryId] = (counts[prod.categoryId] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Compute active filters count (excluding default values)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim().length > 0) count++;
    if (filters.category !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.customization !== 'all') count++;
    return count;
  }, [filters]);

  // Derived state: filtered and sorted product list
  const filteredProducts = useMemo(() => {
    const searchNormalized = filters.search.trim().toLowerCase();

    return products.filter((product) => {
      // 1. Category Filter
      if (filters.category !== 'all' && product.categoryId !== filters.category) {
        return false;
      }

      // 2. Availability Status Filter
      if (filters.status !== 'all' && product.status !== filters.status) {
        return false;
      }

      // 3. Customization Filter
      if (filters.customization === 'customizable') {
        const hasCustomPrinting = product.categoryId === 'custom-printed-nylon' || 
          (product.customizationOptions && product.customizationOptions.some(opt => opt.toLowerCase().includes('flexo') || opt.toLowerCase().includes('print')));
        if (!hasCustomPrinting) return false;
      } else if (filters.customization === 'standard') {
        if (product.categoryId === 'custom-printed-nylon') return false;
      }

      // 4. Search Query Filter (name, description, category, material, specifications)
      if (searchNormalized.length > 0) {
        const matchTitle = (product.name || product.title).toLowerCase().includes(searchNormalized);
        const matchDescription = (product.shortDescription || product.description).toLowerCase().includes(searchNormalized);
        const matchCategory = product.category.toLowerCase().includes(searchNormalized);
        const matchMaterial = product.materialGrade.toLowerCase().includes(searchNormalized);
        const matchSpecs = product.specifications.some(
          spec => spec.label.toLowerCase().includes(searchNormalized) || spec.value.toLowerCase().includes(searchNormalized)
        );

        if (!matchTitle && !matchDescription && !matchCategory && !matchMaterial && !matchSpecs) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sorting Logic
      if (filters.sortBy === 'name-asc') {
        return (a.name || a.title).localeCompare(b.name || b.title);
      }
      if (filters.sortBy === 'name-desc') {
        return (b.name || b.title).localeCompare(a.name || a.title);
      }
      // Default: 'featured' priority, then alphabetical
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.name || a.title).localeCompare(b.name || b.title);
    });
  }, [products, filters]);

  return (
    <div className="py-8 sm:py-12 space-y-12">
      <Container size="xl">
        {/* =========================================================================
            1. PRODUCTS PAGE HEADER & COMPACT BREADCRUMB
            ========================================================================= */}
        <div className="space-y-4 border-b border-[#E6E4DD] pb-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-[#5C635F]">
            <Link
              to="/"
              className="hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-[#88918C]" aria-hidden="true" />
            <span className="font-semibold text-[#252A27]" aria-current="page">
              Products
            </span>
          </nav>

          {/* Heading Block */}
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45] bg-[#EAF3ED] px-2.5 py-0.5 rounded-sm">
              OUR PRODUCTS
            </span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#252A27]">
              Explore Our Product Range
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#5C635F] leading-relaxed">
              Discover packaging options for different needs, from everyday use to commercial supply. Find a product and contact us for pricing and availability.
            </p>
          </div>
        </div>

        {/* =========================================================================
            2. CATEGORY NAVIGATION & SEARCH CONTROLS
            ========================================================================= */}
        <div className="space-y-4 pt-2">
          {/* Category Horizontal Navigation */}
          <CategoryNav
            categories={categories}
            selectedCategoryId={filters.category}
            onSelectCategory={handleCategorySelect}
            categoryCounts={categoryCounts}
            totalCount={products.length}
          />

          {/* Search Bar & Sorting Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex-1 max-w-lg">
              <ProductSearch
                value={filters.search}
                onChange={(search) => handleFilterChange({ search })}
                onClear={() => handleFilterChange({ search: '' })}
              />
            </div>

            <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3">
              <ProductSort
                value={filters.sortBy}
                onChange={(sortBy: ProductSortOption) => handleFilterChange({ sortBy })}
              />
            </div>
          </div>

          {/* Filter Bar (Availability, Customization, Clear Action) */}
          <ProductFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            activeFilterCount={activeFilterCount}
            isOpenMobile={isMobileFiltersOpen}
            onToggleMobile={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          />
        </div>

        {/* =========================================================================
            3. PRODUCT GRID
            ========================================================================= */}
        <div className="pt-4">
          <ProductGrid
            products={filteredProducts}
            totalAvailableCount={products.length}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* =========================================================================
            4. CATALOGUE CALL TO ACTION
            ========================================================================= */}
        <div className="pt-8">
          <div className="bg-[#FAF9F6] border border-[#D8D5CB] rounded-lg p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252A27]">
                Need Help Finding the Right Product?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#5C635F] leading-relaxed">
                Tell us what you need and contact Divine Favour to discuss suitable options and pricing. Our team is available to assist with custom dimensions and bulk orders.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
              <Link to="/request-quote" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  rightIcon={<ArrowRight className="w-4 h-4 stroke-[2]" />}
                >
                  Request a Quote
                </Button>
              </Link>

              <Link to="/contact" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  leftIcon={<PhoneCall className="w-3.5 h-3.5 stroke-[2]" />}
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Provisional Catalogue Notice */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-[#88918C]">
            * Note: Product specifications, gauges, and minimum order quantities shown in this catalogue are provisional baseline estimates. Final order terms are quoted upon enquiry.
          </p>
        </div>
      </Container>
    </div>
  );
};
