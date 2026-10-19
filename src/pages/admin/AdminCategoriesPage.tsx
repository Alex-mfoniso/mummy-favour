import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Package 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { CategoryVisibilityBadge } from '@/components/admin/AdminStatusBadge';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminCategoryModal } from '@/components/admin/AdminCategoryModal';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';
import { 
  listCategories, 
  loadCategories,
  createCategory, 
  updateCategory, 
  deleteCategory,
  checkCategoryProductsCount 
} from '@/services/adminService';
import { AdminCategory } from '@/types/admin';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const cats = await loadCategories();
      setCategories(cats);
    } catch (err) {
      console.error('[AdminCategoriesPage] Refresh error:', err);
    }
  };

  useEffect(() => {
    document.title = 'Category Management | Divine Favour Internal Console';
    refreshData();
  }, []);

  const filteredCategories = useMemo(() => {
    return listCategories({
      search: searchTerm,
      visibility: visibilityFilter,
    });
  }, [categories, searchTerm, visibilityFilter]);

  const showNotice = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleToggleVisibility = async (category: AdminCategory) => {
    try {
      const nextVis = (category.visibility || 'visible') === 'visible' ? 'hidden' : 'visible';
      await updateCategory(category.id, { visibility: nextVis });
      showNotice(`Category "${category.name}" visibility changed to ${nextVis}.`);
      await refreshData();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to update visibility.');
    }
  };

  const handleSaveCategory = async (data: Omit<AdminCategory, 'id'>, id?: string) => {
    try {
      if (id) {
        await updateCategory(id, data);
        showNotice(`Updated category "${data.name}" successfully.`);
      } else {
        await createCategory(data);
        showNotice(`Created category "${data.name}" successfully.`);
      }
      await refreshData();
      setIsModalOpen(false);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to save category.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const { associatedCount } = await deleteCategory(deleteTarget.id);
      showNotice(
        `Deleted category "${deleteTarget.name}". ${
          associatedCount > 0 ? `(${associatedCount} products remain unclassified)` : ''
        }`
      );
      await refreshData();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to delete category.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E4DD] pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#246B45]">
            TAXONOMY & GROUPING
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252A27]">
            Categories
          </h1>
          <p className="text-xs sm:text-sm text-[#5C635F] mt-1">
            Configure product classifications, display sorting, and storefront publishing visibility.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Category
        </Button>
      </div>

      {/* Local Feedback Banner */}
      {bannerNotice && (
        <div className="p-3 bg-[#EAF3ED] border border-[#BADBC5] rounded-md text-xs text-[#1D5838] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#246B45] shrink-0" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* =========================================================================
          SEARCH & FILTER BAR
          ========================================================================= */}
      <div className="bg-white border border-[#D8D5CB] p-4 rounded-lg shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#88918C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded border border-[#D8D5CB] focus:outline-none focus:ring-1 focus:ring-[#246B45] focus:border-[#246B45]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#5C635F]">
            <Filter className="w-3.5 h-3.5" />
            <span>Visibility:</span>
          </div>

          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="text-xs py-2 px-2.5 rounded border border-[#D8D5CB] bg-white text-[#252A27] focus:outline-none focus:ring-1 focus:ring-[#246B45]"
            aria-label="Filter by visibility"
          >
            <option value="all">All States</option>
            <option value="visible">Visible Only</option>
            <option value="hidden">Hidden Only</option>
          </select>

          {(searchTerm || visibilityFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setVisibilityFilter('all');
              }}
              className="text-xs text-[#246B45] hover:underline px-1 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          CATEGORIES TABLE
          ========================================================================= */}
      <div className="bg-white border border-[#D8D5CB] rounded-lg shadow-subtle overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="p-10">
            <AdminEmptyState
              title="No Categories Found"
              description="No categories match your search. Add a new category or reset your filter."
              action={{
                label: 'Add Category',
                onClick: handleOpenAdd,
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#E6E4DD] text-[#5C635F] font-semibold">
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug Identifier</th>
                  <th className="py-3 px-4 text-center">Display Order</th>
                  <th className="py-3 px-4">Products Assigned</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E4DD]">
                {filteredCategories.map((category) => {
                  const productCount = checkCategoryProductsCount(category.id);
                  return (
                    <tr key={category.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#252A27]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded bg-[#FAF9F6] border border-[#E6E4DD] overflow-hidden shrink-0">
                            <OptimizedImage
                              src={category.image}
                              alt={category.name}
                              aspectRatio="square"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#252A27]">
                              {category.name}
                            </div>
                            <div className="text-[11px] text-[#5C635F] truncate max-w-xs">
                              {category.shortDescription}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#88918C] font-mono text-[11px] whitespace-nowrap">
                        {category.slug}
                      </td>

                      <td className="py-3 px-4 text-center text-[#5C635F] font-semibold">
                        #{category.displayOrder || 1}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#5C635F] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E6E4DD]">
                          <Package className="w-3 h-3 text-[#246B45]" />
                          <span>{productCount} products</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <CategoryVisibilityBadge visibility={category.visibility} />
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(category)}
                            className="p-1.5 rounded text-[#5C635F] hover:text-[#252A27] hover:bg-[#F5F4EF]"
                            title={
                              (category.visibility || 'visible') === 'visible'
                                ? 'Hide from storefront'
                                : 'Publish on storefront'
                            }
                          >
                            {(category.visibility || 'visible') === 'visible' ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-[#246B45]" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(category)}
                            className="p-1.5 rounded text-[#246B45] hover:bg-[#EAF3ED]"
                            title="Edit category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(category)}
                            className="p-1.5 rounded text-red-600 hover:bg-red-50"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3.5 bg-[#FAF9F6] border-t border-[#E6E4DD] flex items-center justify-between text-[11px] text-[#88918C]">
          <span>Showing {filteredCategories.length} categories</span>
          <span>*Modifications persist in browser session state</span>
        </div>
      </div>

      {/* =========================================================================
          MODALS
          ========================================================================= */}
      <AdminCategoryModal
        isOpen={isModalOpen}
        category={editingCategory}
        onSave={handleSaveCategory}
        onClose={() => setIsModalOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Category?"
        message={`Are you sure you want to delete the category "${deleteTarget?.name}"?`}
        itemIdentifier={deleteTarget ? `Slug: ${deleteTarget.slug}` : undefined}
        warningNote={
          deleteTarget && checkCategoryProductsCount(deleteTarget.id) > 0
            ? `Warning: There are currently ${checkCategoryProductsCount(
                deleteTarget.id
              )} product(s) associated with this category. Deleting this category will leave those products unclassified in the catalogue.`
            : undefined
        }
        confirmLabel="Delete Category"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
