import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AdminCategory } from '@/types/admin';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export interface AdminCategoryModalProps {
  isOpen: boolean;
  category?: AdminCategory | null;
  onSave: (catData: Omit<AdminCategory, 'id'>, id?: string) => void;
  onClose: () => void;
}

export const AdminCategoryModal: React.FC<AdminCategoryModalProps> = ({
  isOpen,
  category,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(category);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [image, setImage] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [visibility, setVisibility] = useState<'visible' | 'hidden'>('visible');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setShortDescription(category.shortDescription || category.description || '');
      setImage(category.image || '');
      setDisplayOrder(category.displayOrder || 1);
      setVisibility(category.visibility || 'visible');
    } else {
      setName('');
      setSlug('');
      setShortDescription('');
      setImage('/images/categories/carrier-bags.jpg');
      setDisplayOrder(1);
      setVisibility('visible');
    }
    setErrors({});
  }, [category, isOpen]);

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

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Category name is required.';
    if (!slug.trim()) newErrors.slug = 'Category slug identifier is required.';
    if (!shortDescription.trim()) newErrors.shortDescription = 'Description is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Omit<AdminCategory, 'id'> = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      shortDescription: shortDescription.trim(),
      description: shortDescription.trim(),
      image: image.trim() || undefined,
      imageAlt: `${name.trim()} category illustration`,
      displayOrder: Number(displayOrder) || 1,
      visibility,
    };

    onSave(payload, category?.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      <div
        className="bg-white border border-[#D8D5CB] rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#E6E4DD] flex items-center justify-between">
          <div>
            <h2 id="category-modal-title" className="text-base font-bold text-[#252A27]">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h2>
            <p className="text-xs text-[#5C635F]">
              Configure packaging line grouping and storefront visibility.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#88918C] hover:text-[#252A27] hover:bg-[#F5F4EF]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="category-form" className="p-6 space-y-4 overflow-y-auto flex-1">
          <Input
            label="Category Name"
            placeholder="e.g. Agricultural & Greenhouse Films"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            error={errors.name}
          />

          <Input
            label="Category Slug Identifier"
            placeholder="e.g. agricultural-greenhouse-films"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              if (errors.slug) setErrors((prev) => ({ ...prev, slug: '' }));
            }}
            error={errors.slug}
            helperText="Used in URLs: /products?category=slug"
          />

          <Textarea
            label="Category Description"
            placeholder="Brief overview of the packaging applications in this category..."
            rows={3}
            required
            value={shortDescription}
            onChange={(e) => {
              setShortDescription(e.target.value);
              if (errors.shortDescription) setErrors((prev) => ({ ...prev, shortDescription: '' }));
            }}
            error={errors.shortDescription}
          />

          <Input
            label="Category Image URL"
            placeholder="https://..."
            value={image}
            onChange={(e) => setImage(e.target.value)}
            helperText="Representative category banner image."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Display Order"
              type="number"
              min="1"
              max="99"
              value={displayOrder.toString()}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
              helperText="Position in catalogue menus."
            />

            <Select
              label="Storefront Visibility"
              options={[
                { value: 'visible', label: 'Visible (Published)' },
                { value: 'hidden', label: 'Hidden (Draft / Archive)' },
              ]}
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'visible' | 'hidden')}
            />
          </div>
        </form>

        <div className="p-4 border-t border-[#E6E4DD] flex items-center justify-end gap-2.5 bg-[#FAF9F6] rounded-b-lg">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" variant="primary" size="sm">
            {isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </div>
    </div>
  );
};
