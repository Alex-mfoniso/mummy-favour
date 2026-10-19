import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ProductStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminProductModal } from '@/components/admin/AdminProductModal';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';
import { 
  listProducts, 
  loadProducts,
  loadCategories,
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '@/services/adminService';
import { AdminProduct, AdminCategory } from '@/types/admin';

export const AdminProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const [prods, cats] = await Promise.all([loadProducts(), loadCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('[AdminProductsPage] Refresh error:', err);
    }
  };

  useEffect(() => {
    document.title = 'Product Management | Divine Favour Internal Console';
    refreshData();
  }, []);

  // Handle deep-link query parameter ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setEditingProduct(null);
      setIsModalOpen(true);
      // Remove param from url cleanly
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return listProducts({
      search: searchTerm,
      categoryId: selectedCategory,
      status: selectedStatus,
    });
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  const showNotice = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (data: Omit<AdminProduct, 'id'>, id?: string) => {
    try {
      if (id) {
        await updateProduct(id, data);
        showNotice(`Updated product "${data.title}" successfully.`);
      } else {
        await createProduct(data);
        showNotice(`Created new product "${data.title}" successfully.`);
      }
      await refreshData();
      setIsModalOpen(false);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to save product.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      showNotice(`Deleted product "${deleteTarget.title}" successfully.`);
      await refreshData();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to delete product.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          PAGE HEADER & ACTIONS
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E4DD] pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#246B45]">
            CATALOGUE MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252A27]">
            Products
          </h1>
          <p className="text-xs sm:text-sm text-[#5C635F] mt-1">
            Maintain packaging products, technical gauges, dimensions, and availability status.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Product
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
      <div className="bg-white border border-[#D8D5CB] p-4 rounded-lg shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#88918C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title, category, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded border border-[#D8D5CB] focus:outline-none focus:ring-1 focus:ring-[#246B45] focus:border-[#246B45]"
          />
        </div>

        {/* Category & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#5C635F]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-2.5 rounded border border-[#D8D5CB] bg-white text-[#252A27] focus:outline-none focus:ring-1 focus:ring-[#246B45]"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-2.5 rounded border border-[#D8D5CB] bg-white text-[#252A27] focus:outline-none focus:ring-1 focus:ring-[#246B45]"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="in-stock">In Stock</option>
            <option value="made-to-order">Made to Order</option>
            <option value="low-stock">Low Stock</option>
            <option value="custom-order">Custom Order</option>
            <option value="provisional-sample">Provisional Sample</option>
          </select>

          {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-[#246B45] hover:underline px-1 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          PRODUCT LIST TABLE
          ========================================================================= */}
      <div className="bg-white border border-[#D8D5CB] rounded-lg shadow-subtle overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-10">
            {products.length === 0 ? (
              <AdminEmptyState
                title="No Products in Catalogue"
                description="Your product inventory is currently empty. Add your first nylon packaging line."
                action={{
                  label: 'Add Product Now',
                  onClick: handleOpenAdd,
                }}
              />
            ) : (
              <AdminEmptyState
                title="No Matching Products Found"
                description="No products match your current search criteria or category filters. Try clearing your filters."
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                  },
                }}
              />
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#E6E4DD] text-[#5C635F] font-semibold">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E4DD]">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FAF9F6] transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-3 px-4 font-semibold text-[#252A27]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#FAF9F6] border border-[#E6E4DD] overflow-hidden shrink-0">
                          <OptimizedImage
                            src={product.image}
                            alt={product.title}
                            aspectRatio="square"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#252A27] truncate max-w-xs">
                            {product.title}
                          </div>
                          <div className="text-[11px] text-[#88918C] truncate max-w-xs font-mono">
                            /{product.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-[#5C635F] whitespace-nowrap">
                      {product.category}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <ProductStatusBadge status={product.status} />
                    </td>

                    {/* Featured */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {product.featured ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#246B45]">
                          <Sparkles className="w-3 h-3" />
                          <span>Featured</span>
                        </span>
                      ) : (
                        <span className="text-[#88918C] text-[11px]">—</span>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td className="py-3 px-4 text-[#88918C] whitespace-nowrap">
                      {product.lastUpdated || '2026-10-14'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <Link
                          to={`/products/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded text-[#5C635F] hover:text-[#252A27] hover:bg-[#F5F4EF]"
                          title="View on public storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 rounded text-[#246B45] hover:bg-[#EAF3ED]"
                          title="Edit product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="p-1.5 rounded text-red-600 hover:bg-red-50"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3.5 bg-[#FAF9F6] border-t border-[#E6E4DD] flex items-center justify-between text-[11px] text-[#88918C]">
          <span>
            Showing {filteredProducts.length} of {products.length} products
          </span>
          <span>*Modifications persist in browser session state</span>
        </div>
      </div>

      {/* =========================================================================
          MODALS
          ========================================================================= */}
      {/* Add / Edit Product Modal */}
      <AdminProductModal
        isOpen={isModalOpen}
        product={editingProduct}
        categories={categories}
        onSave={handleSaveProduct}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Packaging Product?"
        message={`Are you sure you want to remove this product from the catalogue? This will delete the entry from local session memory.`}
        itemIdentifier={deleteTarget ? `${deleteTarget.title} (slug: ${deleteTarget.slug})` : undefined}
        confirmLabel="Delete Product"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
