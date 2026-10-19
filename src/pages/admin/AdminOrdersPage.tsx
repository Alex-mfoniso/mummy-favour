import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  DollarSign, 
  Loader2, 
  X
} from 'lucide-react';
import { adminOrderService, CreateOrderData } from '@/services/adminOrderService';
import { enquiryService } from '@/services/enquiryService';
import { OrderRecord, OrderStatus, OrderPaymentStatus } from '@/types/order';

export const AdminOrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<OrderPaymentStatus | ''>('');

  // Create Order Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateOrderData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    dispatchMethod: 'WAYBILL',
    discount: 0,
    notes: '',
    items: [
      {
        productName: 'Custom Printed Nylon Bags',
        specifications: 'Standard gauge, 2-color branding',
        quantity: 10,
        unit: 'bundles',
        unitPrice: 25000,
      },
    ],
  });

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminOrderService.fetchOrders({
        search: search.trim() || undefined,
        status: (statusFilter as OrderStatus) || undefined,
        paymentStatus: (paymentFilter as OrderPaymentStatus) || undefined,
      });
      setOrders(res.orders);
    } catch (err: any) {
      setError(err?.message || 'Failed to load order records.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // If redirected from enquiry details with ?convertEnquiryId=...
  useEffect(() => {
    const convertId = searchParams.get('convertEnquiryId');
    if (convertId) {
      enquiryService.getAdminEnquiry(convertId).then((enq) => {
        if (enq) {
          setCreateForm({
            enquiryId: enq.id,
            customerName: enq.customerName || '',
            customerPhone: enq.phone || '',
            customerEmail: enq.email || '',
            deliveryAddress: '',
            dispatchMethod: 'WAYBILL',
            discount: 0,
            notes: `Converted from enquiry reference ${enq.reference || enq.id}`,
            items: enq.items && enq.items.length > 0
              ? enq.items.map((it: any) => ({
                  productName: it.productName || 'Custom Nylon Product',
                  specifications: [it.size, it.gauge, it.color, it.customPrinting].filter(Boolean).join(', ') || 'Custom specifications',
                  quantity: Number(it.quantity) || 10,
                  unit: it.unit || 'bundles',
                  unitPrice: 20000,
                }))
              : [
                  {
                    productName: enq.requestedProductName || 'Custom Printed Nylon Bags',
                    specifications: typeof enq.specifications === 'string' 
                      ? enq.specifications 
                      : enq.specifications 
                      ? JSON.stringify(enq.specifications) 
                      : 'Standard specifications',
                    quantity: Number(enq.quantity) || 10,
                    unit: enq.unit || 'bundles',
                    unitPrice: 25000,
                  },
                ],
          });
          setIsCreateOpen(true);
        }
      }).catch(console.error);
    }
  }, [searchParams]);

  const handleAddItem = () => {
    setCreateForm({
      ...createForm,
      items: [
        ...createForm.items,
        {
          productName: '',
          specifications: '',
          quantity: 1,
          unit: 'bundles',
          unitPrice: 0,
        },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (createForm.items.length <= 1) return;
    setCreateForm({
      ...createForm,
      items: createForm.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...createForm.items];
    updated[index] = { ...updated[index], [field]: value };
    setCreateForm({ ...createForm, items: updated });
  };

  const calculateFormSubtotal = () => {
    return createForm.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  };

  const calculateFormTotal = () => {
    const subtotal = calculateFormSubtotal();
    return Math.max(0, subtotal - (Number(createForm.discount) || 0));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createForm.customerName.trim() || !createForm.customerPhone.trim()) {
      setCreateError('Customer name and phone number are required.');
      return;
    }

    if (createForm.items.some((item) => !item.productName.trim() || item.unitPrice <= 0)) {
      setCreateError('All items must have a product name and valid unit price.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminOrderService.createOrder(createForm);
      setIsCreateOpen(false);
      setCreateForm({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        deliveryAddress: '',
        dispatchMethod: 'WAYBILL',
        discount: 0,
        notes: '',
        items: [
          {
            productName: '',
            specifications: '',
            quantity: 1,
            unit: 'bundles',
            unitPrice: 0,
          },
        ],
      });
      fetchOrders();
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentStatusBadge = (status: OrderPaymentStatus) => {
    switch (status) {
      case 'PAID_IN_FULL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            100% Paid in Full
          </span>
        );
      case 'DEPOSIT_PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <DollarSign className="w-3 h-3 text-blue-600" />
            50% Deposit Verified
          </span>
        );
      case 'BALANCE_SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Balance Submitted
          </span>
        );
      case 'DEPOSIT_SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Deposit Submitted
          </span>
        );
      case 'PENDING_DEPOSIT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Awaiting 50% Deposit
          </span>
        );
    }
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Completed & Released
          </span>
        );
      case 'CLEARED_FOR_RELEASE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-300">
            Cleared for Release
          </span>
        );
      case 'AWAITING_BALANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            Arrived at Park (Awaiting Balance)
          </span>
        );
      case 'DISPATCHED_TO_PARK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
            In Transit to Park
          </span>
        );
      case 'READY_FOR_DISPATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            Ready for Dispatch
          </span>
        );
      case 'IN_PRODUCTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            In Production
          </span>
        );
      case 'PRODUCTION_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Production Done
          </span>
        );
      case 'AWAITING_DEPOSIT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
            Awaiting Deposit
          </span>
        );
    }
  };

  // Metrics
  const countAwaitingDeposit = orders.filter((o) => o.paymentStatus === 'PENDING_DEPOSIT').length;
  const countInProduction = orders.filter((o) => o.productionStatus === 'IN_PRODUCTION').length;
  const countAtPark = orders.filter((o) => o.status === 'AWAITING_BALANCE' || o.status === 'DISPATCHED_TO_PARK').length;
  const countClearedRelease = orders.filter((o) => o.status === 'CLEARED_FOR_RELEASE').length;

  return (
    <div className="space-y-6">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E2E0D8] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#246B45]/10 text-[#246B45] rounded-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#252A27]">
              Order & Waybill Management
            </h1>
            <p className="text-sm text-[#5C645F] mt-0.5">
              Production tracking, 50/50 payment verification, transporter dispatch, and park release authorizations.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setCreateError(null);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#246B45] text-white text-sm font-medium hover:bg-[#1B5234] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#246B45]/40"
        >
          <Plus className="w-4 h-4" />
          Create Direct Order
        </button>
      </div>

      {/* =========================================================================
          OPERATIONAL METRIC CARDS
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E0D8] shadow-xs">
          <div className="text-xs font-semibold text-[#88918C] uppercase tracking-wider">Awaiting 50% Deposit</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{countAwaitingDeposit}</div>
          <div className="text-[11px] text-[#5C645F] mt-0.5">Production locked until verified</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E0D8] shadow-xs">
          <div className="text-xs font-semibold text-[#88918C] uppercase tracking-wider">In Production</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{countInProduction}</div>
          <div className="text-[11px] text-[#5C645F] mt-0.5">Deposit verified, manufacturing active</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E0D8] shadow-xs">
          <div className="text-xs font-semibold text-[#88918C] uppercase tracking-wider">Dispatched / At Park</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{countAtPark}</div>
          <div className="text-[11px] text-[#5C645F] mt-0.5">Held awaiting final 50% balance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E0D8] shadow-xs">
          <div className="text-xs font-semibold text-[#88918C] uppercase tracking-wider">Cleared for Release</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{countClearedRelease}</div>
          <div className="text-[11px] text-[#5C645F] mt-0.5">100% paid in full, release issued</div>
        </div>
      </div>

      {/* =========================================================================
          FILTERS
          ========================================================================= */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E0D8] shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#88918C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F5F4EF] border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45] focus:bg-white text-[#252A27]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-sm bg-[#F5F4EF] border border-[#D5D3C8] rounded-lg text-[#252A27] focus:outline-none focus:border-[#246B45]"
          >
            <option value="">All Operational Statuses</option>
            <option value="AWAITING_DEPOSIT">Awaiting 50% Deposit</option>
            <option value="IN_PRODUCTION">In Production</option>
            <option value="PRODUCTION_COMPLETED">Production Completed</option>
            <option value="READY_FOR_DISPATCH">Ready for Dispatch</option>
            <option value="DISPATCHED_TO_PARK">Dispatched to Park</option>
            <option value="AWAITING_BALANCE">Arrived at Park (Awaiting Balance)</option>
            <option value="CLEARED_FOR_RELEASE">Cleared for Release</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="px-3 py-2 text-sm bg-[#F5F4EF] border border-[#D5D3C8] rounded-lg text-[#252A27] focus:outline-none focus:border-[#246B45]"
          >
            <option value="">All Payment Statuses</option>
            <option value="PENDING_DEPOSIT">Pending Deposit</option>
            <option value="DEPOSIT_SUBMITTED">Deposit Submitted</option>
            <option value="DEPOSIT_PAID">50% Deposit Paid</option>
            <option value="BALANCE_SUBMITTED">Balance Submitted</option>
            <option value="PAID_IN_FULL">100% Paid in Full</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center justify-between text-sm">
          <span>{error}</span>
          <button onClick={fetchOrders} className="text-xs font-semibold text-rose-700 underline">
            Retry
          </button>
        </div>
      )}

      {/* =========================================================================
          ORDERS TABLE
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-[#E2E0D8] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#246B45] animate-spin mb-3" />
            <p className="text-sm text-[#5C645F]">Loading orders and dispatch records...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center px-4">
            <ShoppingBag className="w-12 h-12 text-[#88918C] mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-base font-semibold text-[#252A27]">No orders found</h3>
            <p className="text-sm text-[#5C645F] mt-1">
              No orders currently match the filters. Orders can be converted from accepted quotations or created directly.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E2E0D8] text-xs font-semibold text-[#5C645F] uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Order Details</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Financials (50 / 50)</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Workflow Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E0D8]">
                {orders.map((order) => {
                  const total = Number(order.totalAmount).toLocaleString();
                  const deposit = Number(order.depositRequired).toLocaleString();
                  const balance = Number(order.balanceRequired).toLocaleString();

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-[#246B45] hover:underline flex items-center gap-1.5"
                        >
                          {order.orderNumber}
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                        <div className="text-xs text-[#5C645F] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="text-xs text-[#88918C] mt-1 line-clamp-1">
                            {order.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-[#252A27]">{order.customerName}</div>
                        <div className="text-xs text-[#5C645F] font-mono">{order.customerPhone}</div>
                        {order.deliveryAddress && (
                          <div className="text-xs text-[#88918C] line-clamp-1 mt-0.5">
                            {order.deliveryAddress}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-[#252A27]">
                          ₦{total}
                        </div>
                        <div className="text-[11px] text-[#5C645F] flex items-center gap-2 mt-0.5">
                          <span>Dep: ₦{deposit}</span>
                          <span>•</span>
                          <span>Bal: ₦{balance}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </td>

                      <td className="py-4 px-4">
                        {getOrderStatusBadge(order.status)}
                        {order.dispatch && order.dispatch.transportCompany && (
                          <div className="text-[11px] text-[#5C645F] flex items-center gap-1 mt-1">
                            <Truck className="w-3 h-3 text-[#88918C]" />
                            <span>{order.dispatch.transportCompany}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#246B45] hover:text-white bg-[#246B45]/10 hover:bg-[#246B45] rounded-lg transition-colors"
                        >
                          Manage Order
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: CREATE DIRECT ORDER
          ========================================================================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-[#E2E0D8] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E0D8]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#246B45]" />
                <h3 className="font-semibold text-lg text-[#252A27]">Create Confirmed Order</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-[#88918C] hover:text-[#252A27] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.customerName}
                    onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })}
                    placeholder="e.g. Chief Emeka Obi"
                    className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                    Customer Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.customerPhone}
                    onChange={(e) => setCreateForm({ ...createForm, customerPhone: e.target.value })}
                    placeholder="08012345678"
                    className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                    Customer Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={createForm.customerEmail || ''}
                    onChange={(e) => setCreateForm({ ...createForm, customerEmail: e.target.value })}
                    placeholder="emeka@example.com"
                    className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                    Dispatch Method
                  </label>
                  <select
                    value={createForm.dispatchMethod}
                    onChange={(e) => setCreateForm({ ...createForm, dispatchMethod: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                  >
                    <option value="WAYBILL">Waybill (Commercial Park Transport)</option>
                    <option value="DIRECT_PICKUP">Direct Factory Pickup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Delivery Destination / Park Location
                </label>
                <input
                  type="text"
                  value={createForm.deliveryAddress || ''}
                  onChange={(e) => setCreateForm({ ...createForm, deliveryAddress: e.target.value })}
                  placeholder="e.g. Upper Iweka Park, Onitsha / Trade Fair Complex, Lagos"
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              {/* Items Section */}
              <div className="pt-3 border-t border-[#E2E0D8]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#252A27] uppercase tracking-wider">
                    Agreed Order Items
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-semibold text-[#246B45] hover:underline"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {createForm.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-[#FAF9F5] border border-[#E2E0D8] rounded-lg space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#5C645F]">Item #{index + 1}</span>
                        {createForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-xs text-rose-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Product Name"
                          value={item.productName}
                          onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-white border border-[#D5D3C8] rounded focus:outline-none focus:border-[#246B45]"
                        />

                        <input
                          type="text"
                          placeholder="Specifications / Gauge / Colors"
                          value={item.specifications || ''}
                          onChange={(e) => handleItemChange(index, 'specifications', e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-white border border-[#D5D3C8] rounded focus:outline-none focus:border-[#246B45]"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-[#5C645F]">Quantity</label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                            }
                            className="w-full px-2 py-1 text-xs bg-white border border-[#D5D3C8] rounded focus:outline-none focus:border-[#246B45]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-[#5C645F]">Unit</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-white border border-[#D5D3C8] rounded focus:outline-none focus:border-[#246B45]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-[#5C645F]">Unit Price (₦)</label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1 text-xs bg-white border border-[#D5D3C8] rounded focus:outline-none focus:border-[#246B45]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="p-3 bg-[#EAE8DE]/60 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#5C645F]">Subtotal:</span>
                  <span className="font-semibold text-[#252A27]">
                    ₦{calculateFormSubtotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C645F]">Agreed Discount:</span>
                  <input
                    type="number"
                    min={0}
                    value={createForm.discount || 0}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, discount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-24 px-1.5 py-0.5 text-right text-xs bg-white border border-[#D5D3C8] rounded"
                  />
                </div>
                <div className="flex justify-between pt-1 border-t border-[#D5D3C8] font-bold text-sm text-[#252A27]">
                  <span>Total Order Amount:</span>
                  <span>₦{calculateFormTotal().toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#246B45] font-semibold">
                  <div>50% Deposit: ₦{Math.floor(calculateFormTotal() / 2).toLocaleString()}</div>
                  <div className="text-right">
                    50% Balance: ₦{Math.ceil(calculateFormTotal() / 2).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E0D8]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#5C645F] hover:bg-[#F5F4EF] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#246B45] hover:bg-[#1B5234] rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
