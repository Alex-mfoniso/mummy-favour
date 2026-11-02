import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Package,
  Layers,
  Sparkles,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { AdminProduct, AdminCategory } from '@/types/admin';
import { ProductStatus } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { ProductStatusBadge } from '@/components/admin/AdminStatusBadge';
import {
  loadProducts,
  loadCategories,
  createProduct,
  updateProduct,
  getProduct,
} from '@/services/adminService';

export const AdminProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Data Loading State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [originalProduct, setOriginalProduct] = useState<AdminProduct | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<ProductStatus>('in-stock');
  const [minOrderQuantity, setMinOrderQuantity] = useState('');
  const [materialGrade, setMaterialGrade] = useState('');
  const [thickness, setThickness] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [colors, setColors] = useState('');
  const [featured, setFeatured] = useState(false);

  // Field validation errors & banner
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;

    async function init() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [prods, cats] = await Promise.all([loadProducts(), loadCategories()]);
        if (!isMounted) return;

        setCategories(cats);

        if (isEditing && id) {
          const found = prods.find((p) => p.id === id || p.slug === id) || getProduct(id);
          if (found) {
            setOriginalProduct(found);
            setTitle(found.title);
            setSlug(found.slug);
            setCategoryId(found.categoryId);
            setTagline(found.tagline || found.shortDescription || '');
            setDescription(found.description || found.fullDescription || '');
            setImage(found.image || '');
            setStatus(found.status || 'in-stock');
            setMinOrderQuantity(found.minOrderQuantity || '');
            setMaterialGrade(found.materialGrade || '');
            setThickness(found.thickness || '');
            setDimensions(found.dimensions?.join(', ') || '');
            setColors(found.availableColors?.join(', ') || '');
            setFeatured(Boolean(found.featured));
            document.title = `Edit: ${found.title} | Admin Product Management`;
          } else {
            setLoadError(`Product with ID "${id}" could not be found.`);
          }
        } else {
          // Defaults for new product
          setTitle('');
          setSlug('');
          setCategoryId(cats[0]?.id || 'carrier-bags');
          setTagline('');
          setDescription('');
          setImage('/images/products/carrier-bag-white-stack.jpg');
          setStatus('in-stock');
          setMinOrderQuantity('1,000 units');
          setMaterialGrade('Virgin LDPE / HDPE Resin');
          setThickness('40-50 microns');
          setDimensions('30cm x 40cm, 40cm x 50cm');
          setColors('Clear, White, Custom Pantone');
          setFeatured(false);
          document.title = 'Add New Packaging Product | Admin Product Management';
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setLoadError((err as Error).message || 'Failed to load product data.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  // Title change with automatic slug generator for new products
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
  };

  const generateSlugFromTitle = () => {
    if (title.trim()) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
      if (errors.slug) setErrors((prev) => ({ ...prev, slug: '' }));
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Product title is required.';
    if (!slug.trim()) newErrors.slug = 'Product slug identifier is required.';
    if (!categoryId) newErrors.categoryId = 'Please select a packaging category.';
    if (!tagline.trim()) newErrors.tagline = 'Short summary / tagline is required.';
    if (!description.trim()) newErrors.description = 'Full product description is required.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setSubmitError('Please address the highlighted fields before saving.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    setSubmitError(null);
    return true;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setSubmitError(null);

    const matchedCat = categories.find((c) => c.id === categoryId);
    const categoryName = matchedCat ? matchedCat.name : 'Nylon Packaging';

    const parsedDimensions = dimensions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedColors = colors
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const productPayload: Omit<AdminProduct, 'id'> = {
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      categoryId,
      category: categoryName,
      tagline: tagline.trim(),
      description: description.trim(),
      image: image.trim() || undefined,
      imageAlt: `${title.trim()} nylon packaging specimen`,
      status,
      minOrderQuantity: minOrderQuantity.trim() || 'Contact for MOQ',
      targetAudience: originalProduct?.targetAudience || ['retailer', 'wholesaler', 'commercial'],
      materialGrade: materialGrade.trim() || 'Virgin Polymer Resin',
      thickness: thickness.trim() || undefined,
      dimensions: parsedDimensions.length > 0 ? parsedDimensions : undefined,
      availableColors: parsedColors.length > 0 ? parsedColors : undefined,
      featured,
      specifications: originalProduct?.specifications || [
        { label: 'Primary Polymer', value: materialGrade.trim() || 'Virgin Polyethylene' },
        { label: 'Available Gauges', value: thickness.trim() || 'Custom on order' },
      ],
    };

    try {
      if (isEditing && id) {
        await updateProduct(id, productPayload);
        navigate('/admin/products', {
          state: { notice: `Updated product "${title.trim()}" successfully.` },
        });
      } else {
        await createProduct(productPayload);
        navigate('/admin/products', {
          state: { notice: `Created new product "${title.trim()}" successfully.` },
        });
      }
    } catch (err: unknown) {
      setIsSaving(false);
      setSubmitError((err as Error).message || 'Failed to save product. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard shortcut Ctrl+S or Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const form = document.getElementById('product-edit-form') as HTMLFormElement | null;
        if (form) {
          form.requestSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // =========================================================================
  // LOADING & ERROR STATES
  // =========================================================================
  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#246B45] animate-spin" />
        <p className="text-sm text-[#5C635F]">
          {isEditing ? 'Loading product details...' : 'Initializing product editor...'}
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white border border-[#D8D5CB] rounded-xl p-8 text-center space-y-4 shadow-subtle">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#252A27]">Product Not Found</h2>
          <p className="text-sm text-[#5C635F] max-w-md mx-auto">{loadError}</p>
          <div className="pt-2">
            <Link to="/admin/products">
              <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Products List
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dimension & Color helper badge arrays
  const parsedDimensionsList = dimensions
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const parsedColorsList = colors
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6 pb-16">
      {/* =========================================================================
          BREADCRUMBS & TOP NAVIGATION
          ========================================================================= */}
      <div className="flex items-center justify-between text-xs text-[#5C635F]">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 font-semibold text-[#246B45] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#88918C]">
          <span>Catalogue</span>
          <span>/</span>
          <Link to="/admin/products" className="hover:text-[#252A27]">
            Products
          </Link>
          <span>/</span>
          <span className="text-[#252A27] font-medium">
            {isEditing ? 'Edit Product' : 'New Product'}
          </span>
        </div>
      </div>

      {/* =========================================================================
          PAGE HEADER & PRIMARY ACTIONS (TOP BAR)
          ========================================================================= */}
      <div className="bg-white border border-[#D8D5CB] p-5 rounded-xl shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#246B45]">
              {isEditing ? 'Catalogue Management' : 'New Catalogue Item'}
            </span>
            {isEditing && originalProduct && (
              <>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F4EF] text-[#5C635F]">
                  ID: {originalProduct.id.slice(0, 8)}
                </span>
                <ProductStatusBadge status={originalProduct.status} />
              </>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252A27]">
            {isEditing ? `Edit: ${originalProduct?.title || title}` : 'Add New Packaging Product'}
          </h1>
          <p className="text-xs sm:text-sm text-[#5C635F] mt-1">
            {isEditing
              ? 'Update extrusion gauges, dimensions, visual assets, and storefront availability.'
              : 'Add a new flexible polyethylene product line to the public catalogue.'}
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {isEditing && originalProduct?.slug && (
            <Link
              to={`/products/${originalProduct.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs text-[#5C635F] hover:text-[#246B45] px-3 py-2 rounded-lg border border-[#D8D5CB] hover:bg-[#F5F4EF] transition-colors"
              title="Preview product on public storefront"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </Link>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/products')}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="product-edit-form"
            variant="primary"
            size="sm"
            leftIcon={
              isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )
            }
            disabled={isSaving}
            className="shadow-sm min-w-[130px]"
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </div>

      {/* Top Error Alert */}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold">Unable to save product</p>
            <p className="mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN FORM CONTENT
          ========================================================================= */}
      <form id="product-edit-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* =====================================================================
              LEFT COLUMN (2 COLS on LG): General Info & Specs
              ===================================================================== */}
          <div className="lg:col-span-2 space-y-6">
            {/* CARD 1: General Information */}
            <div className="bg-white border border-[#D8D5CB] rounded-xl p-5 sm:p-6 shadow-subtle space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E6E4DD]">
                <div className="p-1.5 rounded-md bg-[#EAF3ED] text-[#246B45]">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#246B45]">
                    General Information
                  </h2>
                  <p className="text-[11px] text-[#5C635F]">
                    Customer-facing product naming, URL routing, and descriptive content.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Product Title / Name"
                  placeholder="e.g. Heavy-Duty Gusseted Liners"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  error={errors.title}
                  helperText="Clear commercial name displayed in search and product headings."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="URL Slug Identifier"
                      placeholder="e.g. heavy-duty-gusseted-liners"
                      required
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        if (errors.slug) setErrors((prev) => ({ ...prev, slug: '' }));
                      }}
                      error={errors.slug}
                      helperText="Lowercase alphanumeric letters and hyphens."
                    />
                    {!isEditing && title.trim() && (
                      <button
                        type="button"
                        onClick={generateSlugFromTitle}
                        className="mt-1 text-[11px] text-[#246B45] hover:underline"
                      >
                        Regenerate slug from title
                      </button>
                    )}
                  </div>

                  <Select
                    label="Packaging Category"
                    required
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: '' }));
                    }}
                    error={errors.categoryId}
                  />
                </div>

                <Input
                  label="Short Tagline / Summary"
                  placeholder="e.g. Reinforced bottom seal bags for moisture-proof containment"
                  required
                  value={tagline}
                  onChange={(e) => {
                    setTagline(e.target.value);
                    if (errors.tagline) setErrors((prev) => ({ ...prev, tagline: '' }));
                  }}
                  error={errors.tagline}
                  helperText="One-sentence teaser shown on catalog grids and quote selectors."
                />

                <Textarea
                  label="Full Product Description"
                  placeholder="Detailed description of packaging structure, tear resistance, suitable industries, and commercial applications..."
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  error={errors.description}
                  helperText="Paragraph text rendered on the dedicated product overview page."
                />
              </div>
            </div>

            {/* CARD 2: Technical Specifications */}
            <div className="bg-white border border-[#D8D5CB] rounded-xl p-5 sm:p-6 shadow-subtle space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DD]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#EAF3ED] text-[#246B45]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#246B45]">
                      Technical Specifications
                    </h2>
                    <p className="text-[11px] text-[#5C635F]">
                      Extrusion resin blend, thickness gauges, and standard dimensional variants.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#E6E4DD] text-[#88918C]">
                  Optional
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Material Grade"
                  placeholder="e.g. Virgin LDPE / HDPE Blend"
                  value={materialGrade}
                  onChange={(e) => setMaterialGrade(e.target.value)}
                  helperText="Polymer composition used in manufacturing."
                />

                <Input
                  label="Thickness / Gauge"
                  placeholder="e.g. 40 to 80 microns"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  helperText="Available micron or gauge thickness range."
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Available Sizes / Dimensions"
                    placeholder="e.g. 30x40cm, 40x50cm, 50x70cm"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    helperText="Separate multiple sizes with commas."
                  />
                  {parsedDimensionsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[11px] text-[#88918C] mr-1 self-center">Preview:</span>
                      {parsedDimensionsList.map((dim, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 bg-[#FAF9F6] border border-[#E6E4DD] text-[#252A27] rounded-md font-mono"
                        >
                          {dim}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Available Colours"
                    placeholder="e.g. Clear, Milky White, Blue, Custom Pantone"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    helperText="Separate multiple colours with commas."
                  />
                  {parsedColorsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[11px] text-[#88918C] mr-1 self-center">Preview:</span>
                      {parsedColorsList.map((c, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 bg-[#FAF9F6] border border-[#E6E4DD] text-[#252A27] rounded-md"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              RIGHT COLUMN (1 COL on LG): Stock, Media, Storefront Promotion
              ===================================================================== */}
          <div className="space-y-6">
            {/* CARD 3: Inventory & Availability */}
            <div className="bg-white border border-[#D8D5CB] rounded-xl p-5 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E6E4DD]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
                  Inventory & Status
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Select
                    label="Availability Status"
                    required
                    options={[
                      { value: 'in-stock', label: 'In Stock' },
                      { value: 'made-to-order', label: 'Made to Order' },
                      { value: 'low-stock', label: 'Low Stock' },
                      { value: 'custom-order', label: 'Custom Order' },
                      { value: 'provisional-sample', label: 'Provisional Sample' },
                    ]}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-[#88918C]">Badge Preview:</span>
                    <ProductStatusBadge status={status} />
                  </div>
                </div>

                <Input
                  label="Minimum Order Quantity (MOQ)"
                  placeholder="e.g. 1,000 units or 10 rolls"
                  value={minOrderQuantity}
                  onChange={(e) => setMinOrderQuantity(e.target.value)}
                  helperText="Displayed to clients on quotation forms."
                />
              </div>
            </div>

            {/* CARD 4: Media & Imagery */}
            <div className="bg-white border border-[#D8D5CB] rounded-xl p-5 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E6E4DD]">
                <div className="p-1 rounded-md bg-[#EAF3ED] text-[#246B45]">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
                  Media & Imagery
                </h3>
              </div>

              <div className="space-y-3">
                <Input
                  label="Main Image URL"
                  placeholder="https://... or /images/products/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  helperText="URL to high-resolution packaging photo or local path."
                />

                {/* Live Image Preview Card */}
                <div>
                  <span className="block text-xs font-medium text-[#252A27] mb-1.5">
                    Live Thumbnail Preview
                  </span>
                  <div className="w-full aspect-4/3 rounded-lg border border-[#D8D5CB] overflow-hidden bg-[#FAF9F6] flex items-center justify-center relative group">
                    {image ? (
                      <img
                        src={image}
                        alt={title ? `${title} preview` : 'Product preview'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/products/carrier-bag-white-stack.jpg';
                        }}
                      />
                    ) : (
                      <div className="text-center p-4 text-[#88918C]">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-xs">No image provided</span>
                        <p className="text-[10px] mt-0.5">Using standard industrial placeholder</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-2.5 bg-[#FAF9F6] border border-[#E6E4DD] rounded-md text-[11px] text-[#5C635F] flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#246B45] shrink-0 mt-0.5" />
                  <span>
                    Square or 4:3 aspect ratio images with neutral backgrounds are recommended.
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 5: Storefront Promotion */}
            <div className="bg-white border border-[#D8D5CB] rounded-xl p-5 shadow-subtle">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-[#246B45] rounded border-[#D8D5CB] focus:ring-[#246B45] cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#246B45]" />
                    <span className="text-xs font-bold text-[#252A27]">
                      Featured Storefront Product
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5C635F] mt-1">
                    Promote this item on the homepage showcase grid and featured packaging carousel.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM ACTIONS BAR (PROMINENT & UNMISSABLE)
            ========================================================================= */}
        <div className="bg-white border border-[#D8D5CB] rounded-xl p-4 sm:p-5 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20">
          <div className="flex items-center gap-2 text-xs text-[#5C635F]">
            <CheckCircle2 className="w-4 h-4 text-[#246B45] shrink-0" />
            <span>
              All product changes will be saved to your active catalogue database.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/admin/products')}
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={
                isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )
              }
              disabled={isSaving}
              className="shadow-md flex-1 sm:flex-none min-w-[160px] text-sm font-semibold"
            >
              {isSaving ? 'Saving Changes...' : isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
