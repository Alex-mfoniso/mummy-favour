import React, { useState, useEffect } from 'react';
import { X, Package, Layers, Sparkles, Image as ImageIcon } from 'lucide-react';
import { AdminProduct, AdminCategory } from '@/types/admin';
import { ProductStatus } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export interface AdminProductModalProps {
  isOpen: boolean;
  product?: AdminProduct | null;
  categories: AdminCategory[];
  onSave: (productData: Omit<AdminProduct, 'id'>, id?: string) => void;
  onClose: () => void;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  product,
  categories,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(product);

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setSlug(product.slug);
      setCategoryId(product.categoryId);
      setTagline(product.tagline);
      setDescription(product.description);
      setImage(product.image || '');
      setStatus(product.status);
      setMinOrderQuantity(product.minOrderQuantity || '');
      setMaterialGrade(product.materialGrade || '');
      setThickness(product.thickness || '');
      setDimensions(product.dimensions?.join(', ') || '');
      setColors(product.availableColors?.join(', ') || '');
      setFeatured(Boolean(product.featured));
    } else {
      // Defaults for new product
      setTitle('');
      setSlug('');
      setCategoryId(categories[0]?.id || 'carrier-bags');
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
    }
    setErrors({});
  }, [product, categories, isOpen]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && !slug) {
      // Auto-suggest slug
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Product title is required.';
    if (!slug.trim()) newErrors.slug = 'Product slug identifier is required.';
    if (!categoryId) newErrors.categoryId = 'Please select a packaging category.';
    if (!tagline.trim()) newErrors.tagline = 'Short summary / tagline is required.';
    if (!description.trim()) newErrors.description = 'Full product description is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

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
      targetAudience: product?.targetAudience || ['retailer', 'wholesaler', 'commercial'],
      materialGrade: materialGrade.trim() || 'Virgin Polymer Resin',
      thickness: thickness.trim() || undefined,
      dimensions: parsedDimensions.length > 0 ? parsedDimensions : undefined,
      availableColors: parsedColors.length > 0 ? parsedColors : undefined,
      featured,
      specifications: product?.specifications || [
        { label: 'Primary Polymer', value: materialGrade.trim() || 'Virgin Polyethylene' },
        { label: 'Available Gauges', value: thickness.trim() || 'Custom on order' },
      ],
    };

    onSave(productPayload, product?.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center">
        <div
          className="relative bg-white border border-[#D8D5CB] rounded-xl shadow-2xl max-w-2xl sm:max-w-3xl w-full flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E6E4DD] flex items-center justify-between bg-white shrink-0 z-10">
            <div className="pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#246B45]">
                  {isEditing ? 'Packaging Catalogue' : 'New Packaging Entry'}
                </span>
                {isEditing && product && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F5F4EF] text-[#5C635F]">
                    ID: {product.id.slice(0, 8)}
                  </span>
                )}
              </div>
              <h2 id="product-modal-title" className="text-base sm:text-lg font-bold text-[#252A27]">
                {isEditing ? `Edit: ${product?.title || 'Product'}` : 'Add New Packaging Product'}
              </h2>
              <p className="text-xs text-[#5C635F] mt-0.5">
                {isEditing
                  ? 'Update technical gauges, dimensions, stock availability, and presentation details.'
                  : 'Create a new packaging entry in local demonstration state.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-[#88918C] hover:text-[#252A27] hover:bg-[#F5F4EF] transition-colors shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form
            onSubmit={handleSubmit}
            id="product-form"
            className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 min-h-0 overscroll-contain"
          >
            {/* Section 1: General Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-[#E6E4DD]">
                <Package className="w-4 h-4 text-[#246B45]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
                  General Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Product Name"
                    placeholder="e.g. Heavy-Duty Gusseted Liners"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    error={errors.title}
                  />
                </div>

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

                <div className="sm:col-span-2">
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
                  />
                </div>

                <div className="sm:col-span-2">
                  <Textarea
                    label="Full Product Description"
                    placeholder="Detailed description of packaging structure, tear resistance, and commercial applications..."
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                    }}
                    error={errors.description}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Media & Inventory */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-2 pb-1 border-b border-[#E6E4DD]">
                <ImageIcon className="w-4 h-4 text-[#246B45]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
                  Media & Stock Availability
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <Input
                        label="Main Image URL"
                        placeholder="https://... or /images/products/..."
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        helperText="Leave blank to use default industrial packaging placeholder."
                      />
                    </div>
                    {image ? (
                      <div className="mt-6 w-12 h-12 rounded-md border border-[#D8D5CB] overflow-hidden bg-[#F5F4EF] shrink-0 flex items-center justify-center">
                        <img
                          src={image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

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

                <Input
                  label="Minimum Order Quantity (MOQ)"
                  placeholder="e.g. 1,000 units or 10 rolls"
                  value={minOrderQuantity}
                  onChange={(e) => setMinOrderQuantity(e.target.value)}
                />
              </div>
            </div>

            {/* Section 3: Technical Specifications (Optional) */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between pb-1 border-b border-[#E6E4DD]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#246B45]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
                    Technical Specifications (Optional)
                  </h3>
                </div>
                <span className="text-[11px] text-[#88918C]">Flexible extrusion specs</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Material Grade"
                  placeholder="e.g. Virgin LDPE / HDPE Blend"
                  value={materialGrade}
                  onChange={(e) => setMaterialGrade(e.target.value)}
                />

                <Input
                  label="Thickness / Gauge"
                  placeholder="e.g. 40 to 80 microns"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                />

                <Input
                  label="Available Sizes / Dimensions"
                  placeholder="e.g. 30x40cm, 40x50cm, 50x70cm"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  helperText="Separate multiple sizes with commas."
                />

                <Input
                  label="Available Colours"
                  placeholder="e.g. Clear, Milky White, Blue, Custom"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  helperText="Separate multiple colours with commas."
                />
              </div>
            </div>

            {/* Section 4: Storefront Promotion */}
            <div className="p-3.5 bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#246B45] rounded border-[#D8D5CB] focus:ring-[#246B45] cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#246B45]" />
                    <span className="text-xs font-bold text-[#252A27]">
                      Featured Storefront Product
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5C635F]">
                    Promote this item on the homepage showcase and featured packaging carousels.
                  </p>
                </div>
              </label>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="p-3.5 sm:p-4 border-t border-[#E6E4DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F6] shrink-0 z-10">
            <span className="text-[11px] text-[#88918C]">
              *Modifications persist in browser demonstration state.
            </span>
            <div className="flex items-center justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button
                type="submit"
                form="product-form"
                variant="primary"
                size="sm"
              >
                {isEditing ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
