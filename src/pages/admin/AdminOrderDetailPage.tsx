import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Phone,
  MapPin,
  Loader2,
  Plus,
  X
} from 'lucide-react';
import { adminOrderService, RecordPaymentData, DispatchData } from '@/services/adminOrderService';
import {
  OrderRecord,
  OrderProductionStatus,
} from '@/types/order';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals state
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState<RecordPaymentData>({
    paymentType: 'DEPOSIT',
    amountReceived: 0,
    paymentMethod: 'Bank Transfer',
    paymentReference: '',
    customerClaimRef: '',
    internalNotes: '',
  });

  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [dispatchForm, setDispatchForm] = useState<DispatchData>({
    dispatchMethod: 'WAYBILL',
    transportCompany: '',
    parkDestination: '',
    waybillNumber: '',
    driverName: '',
    driverPhone: '',
    vehiclePlate: '',
  });

  const [isParkArrivalOpen, setIsParkArrivalOpen] = useState(false);
  const [parkArrivalForm, setParkArrivalForm] = useState({
    arrivalConfirmerName: '',
    arrivalNotes: '',
  });

  const [isAuthorizeReleaseOpen, setIsAuthorizeReleaseOpen] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminOrderService.fetchOrderById(id);
      setOrder(data);

      // Pre-fill payment form default amount based on status
      const depositRequired = Number(data.depositRequired);
      const balanceRequired = Number(data.balanceRequired);
      const isDepositPaid = Number(data.depositPaid) >= depositRequired;

      setPaymentForm((prev) => ({
        ...prev,
        paymentType: isDepositPaid ? 'BALANCE' : 'DEPOSIT',
        amountReceived: isDepositPaid ? balanceRequired : depositRequired,
      }));

      // Pre-fill dispatch form if address exists
      if (data.deliveryAddress) {
        setDispatchForm((prev) => ({
          ...prev,
          parkDestination: data.deliveryAddress || '',
        }));
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load order details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      await adminOrderService.recordPayment(order.id, paymentForm);
      setIsRecordPaymentOpen(false);
      setActionSuccess('Payment recorded successfully. Authorized staff can now verify it.');
      fetchOrder();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string, status: 'VERIFIED' | 'REJECTED') => {
    if (!order) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      await adminOrderService.verifyPayment(order.id, paymentId, status);
      setActionSuccess(`Payment successfully marked as ${status}.`);
      fetchOrder();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update payment status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduction = async (newStatus: OrderProductionStatus) => {
    if (!order) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      await adminOrderService.updateProductionStatus(order.id, newStatus);
      setActionSuccess(`Production status changed to ${newStatus}.`);
      fetchOrder();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update production status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      await adminOrderService.dispatchOrder(order.id, dispatchForm);
      setIsDispatchOpen(false);
      setActionSuccess('Order dispatched to transport park.');
      fetchOrder();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to record dispatch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParkArrivalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      await adminOrderService.recordParkArrival(
        order.id,
        parkArrivalForm.arrivalConfirmerName,
        parkArrivalForm.arrivalNotes
      );
      setIsParkArrivalOpen(false);
      setActionSuccess(
        'Driver arrival confirmed at park! Goods held in park awaiting final 50% balance payment.'
      );
      fetchOrder();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to record arrival.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthorizeReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      await adminOrderService.authorizeRelease(order.id, releaseNotes);
      setIsAuthorizeReleaseOpen(false);
      setActionSuccess(
        'Release authorization successfully issued! Transporter can hand goods over to customer.'
      );
      fetchOrder();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to authorize release.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmHandover = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure the customer has received their goods? This will complete the order.')) {
      return;
    }
    setActionError(null);
    try {
      setIsSubmitting(true);
      await adminOrderService.confirmHandover(order.id);
      setActionSuccess('Order marked as Completed!');
      fetchOrder();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to confirm handover.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-[#246B45] animate-spin mb-3" />
        <p className="text-sm text-[#5C645F]">Loading order workspace...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white p-8 rounded-xl border border-rose-200 text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#252A27]">Order Not Found</h2>
        <p className="text-sm text-[#5C645F] mt-1">{error || 'Requested order could not be loaded.'}</p>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#246B45] text-white text-sm font-medium rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  const isDepositVerified = Number(order.depositPaid) >= Number(order.depositRequired);
  const isPaidInFull = order.paymentStatus === 'PAID_IN_FULL';
  const hasDispatched = order.dispatch && order.dispatch.dispatchStatus !== 'NOT_DISPATCHED';
  const hasArrivedAtPark =
    order.dispatch &&
    (order.dispatch.dispatchStatus === 'ARRIVED_AT_PARK' ||
      order.dispatch.dispatchStatus === 'HOLD_CONFIRMED' ||
      order.dispatch.dispatchStatus === 'CLEARED_FOR_RELEASE' ||
      order.dispatch.dispatchStatus === 'RELEASED');
  const isClearedForRelease =
    order.dispatch &&
    (order.dispatch.dispatchStatus === 'CLEARED_FOR_RELEASE' ||
      order.dispatch.dispatchStatus === 'RELEASED');
  const isCompleted = order.status === 'COMPLETED';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* =========================================================================
          NAVIGATION & HEADER
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E2E0D8] shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 text-[#5C645F] hover:text-[#252A27] hover:bg-[#F5F4EF] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-mono font-bold text-[#252A27]">
                {order.orderNumber}
              </h1>
              {order.enquiry && (
                <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full border border-stone-200">
                  From Enquiry #{order.enquiry.referenceNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-[#5C645F] mt-0.5">
              Created on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              {order.createdBy && `by ${order.createdBy.name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActionError(null);
              setIsRecordPaymentOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#246B45] text-white rounded-lg hover:bg-[#1B5234] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center justify-between text-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center justify-between text-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          WORKFLOW STEPPER
          ========================================================================= */}
      <div className="bg-white p-6 rounded-xl border border-[#E2E0D8] shadow-sm">
        <h2 className="text-xs font-bold text-[#88918C] uppercase tracking-wider mb-4">
          Manufacturing & Fulfillment Pipeline
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Step 1: 50% Deposit */}
          <div
            className={`p-3 rounded-lg border ${
              isDepositVerified
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">1. 50% Deposit</span>
              {isDepositVerified ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <div className="text-[11px] mt-1">
              {isDepositVerified ? 'Verified & Authorized' : 'Pending Verification'}
            </div>
          </div>

          {/* Step 2: Production */}
          <div
            className={`p-3 rounded-lg border ${
              order.productionStatus === 'PRODUCTION_COMPLETED' ||
              order.productionStatus === 'READY_FOR_DISPATCH' ||
              hasDispatched
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : order.productionStatus === 'IN_PRODUCTION'
                ? 'bg-purple-50 border-purple-300 text-purple-900'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">2. Manufacturing</span>
              <Package className="w-4 h-4" />
            </div>
            <div className="text-[11px] mt-1">
              {order.productionStatus.replace('_', ' ')}
            </div>
          </div>

          {/* Step 3: Waybill Dispatch */}
          <div
            className={`p-3 rounded-lg border ${
              hasArrivedAtPark
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : hasDispatched
                ? 'bg-sky-50 border-sky-300 text-sky-900'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">3. Waybill to Park</span>
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-[11px] mt-1">
              {order.dispatch?.dispatchStatus || 'Not Dispatched'}
            </div>
          </div>

          {/* Step 4: Balance & Release */}
          <div
            className={`p-3 rounded-lg border ${
              isCompleted
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : isClearedForRelease
                ? 'bg-teal-50 border-teal-300 text-teal-900'
                : isPaidInFull
                ? 'bg-blue-50 border-blue-300 text-blue-900'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">4. Balance & Release</span>
              {isClearedForRelease ? (
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
            </div>
            <div className="text-[11px] mt-1">
              {isCompleted
                ? 'Order Completed'
                : isClearedForRelease
                ? 'Cleared for Release'
                : isPaidInFull
                ? 'Paid, Awaiting Release'
                : 'Awaiting 50% Balance'}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          OPERATIONAL ACTION CENTER
          ========================================================================= */}
      <div className="bg-gradient-to-r from-[#246B45]/5 to-transparent p-6 rounded-xl border border-[#246B45]/20 shadow-sm">
        <h2 className="text-sm font-bold text-[#252A27] flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-[#246B45]" />
          Operational Next Steps & Controls
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Action 1: Production Authorization */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E0D8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5C645F] uppercase">Factory Floor</span>
              <Package className="w-4 h-4 text-[#246B45]" />
            </div>

            <div className="text-xs text-[#5C645F]">
              Current status: <span className="font-bold text-[#252A27]">{order.productionStatus}</span>
            </div>

            {order.productionStatus === 'AWAITING_DEPOSIT' ? (
              <div>
                <button
                  onClick={() => handleUpdateProduction('IN_PRODUCTION')}
                  disabled={!isDepositVerified || isSubmitting}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Start Production
                </button>
                {!isDepositVerified && (
                  <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    Locked: 50% deposit must be verified first!
                  </p>
                )}
              </div>
            ) : order.productionStatus === 'IN_PRODUCTION' ? (
              <button
                onClick={() => handleUpdateProduction('PRODUCTION_COMPLETED')}
                disabled={isSubmitting}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Mark Production Completed
              </button>
            ) : order.productionStatus === 'PRODUCTION_COMPLETED' ? (
              <button
                onClick={() => handleUpdateProduction('READY_FOR_DISPATCH')}
                disabled={isSubmitting}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Ready for Dispatch
              </button>
            ) : (
              <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Production Done & Dispatched
              </div>
            )}
          </div>

          {/* Action 2: Transporter / Waybill Dispatch */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E0D8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5C645F] uppercase">Waybill Dispatch</span>
              <Truck className="w-4 h-4 text-sky-600" />
            </div>

            {!hasDispatched ? (
              <div>
                <button
                  onClick={() => setIsDispatchOpen(true)}
                  disabled={
                    order.productionStatus !== 'READY_FOR_DISPATCH' &&
                    order.productionStatus !== 'PRODUCTION_COMPLETED'
                  }
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Dispatch to Transport Park
                </button>
                {order.productionStatus !== 'READY_FOR_DISPATCH' && (
                  <p className="text-[11px] text-[#88918C] mt-1.5">
                    Production must be marked completed before dispatch.
                  </p>
                )}
              </div>
            ) : !hasArrivedAtPark ? (
              <div>
                <button
                  onClick={() => setIsParkArrivalOpen(true)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                >
                  Record Driver Arrival at Park
                </button>
                <p className="text-[11px] text-[#5C645F] mt-1.5">
                  Confirm when driver reaches destination park.
                </p>
              </div>
            ) : (
              <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Arrived at Destination Park
              </div>
            )}

            {order.dispatch && order.dispatch.transportCompany && (
              <div className="text-[11px] text-[#5C645F] bg-[#FAF9F5] p-2 rounded">
                <div>Transport: <span className="font-semibold">{order.dispatch.transportCompany}</span></div>
                <div>Park: <span className="font-semibold">{order.dispatch.parkDestination}</span></div>
                {order.dispatch.driverPhone && (
                  <div>Driver: {order.dispatch.driverName} ({order.dispatch.driverPhone})</div>
                )}
              </div>
            )}
          </div>

          {/* Action 3: Release Authorization (Crucial Invariant!) */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E0D8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5C645F] uppercase">Park Release Authorization</span>
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>

            {!isClearedForRelease ? (
              <div>
                <button
                  onClick={() => setIsAuthorizeReleaseOpen(true)}
                  disabled={!isPaidInFull || isSubmitting}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Authorize Park Release
                </button>
                {!isPaidInFull ? (
                  <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Park holds goods! Cannot release until 100% balance is verified.
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-700 mt-1.5 font-medium">
                    100% Paid in Full! Release can be issued to transporter.
                  </p>
                )}
              </div>
            ) : !isCompleted ? (
              <button
                onClick={handleConfirmHandover}
                disabled={isSubmitting}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Confirm Customer Handover
              </button>
            ) : (
              <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Order Fulfilled & Closed
              </div>
            )}

            {order.dispatch?.releaseAuthorizedAt && (
              <div className="text-[11px] text-[#5C645F] bg-teal-50 border border-teal-200 p-2 rounded">
                <div>Authorized by: {order.dispatch.releaseAuthorizedBy?.name || 'Authorized Staff'}</div>
                <div>Date: {new Date(order.dispatch.releaseAuthorizedAt).toLocaleDateString()}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          FINANCIAL BREAKDOWN & 50/50 STATUS
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E2E0D8] shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-[#88918C] uppercase tracking-wider">
            Customer Information
          </h2>
          <div className="space-y-2 text-sm">
            <div className="font-bold text-[#252A27] text-base">{order.customerName}</div>
            <div className="flex items-center gap-2 text-[#5C645F]">
              <Phone className="w-4 h-4 text-[#88918C]" />
              <a href={`tel:${order.customerPhone}`} className="hover:underline font-mono">
                {order.customerPhone}
              </a>
            </div>
            {order.customerEmail && (
              <div className="text-[#5C645F] text-xs">{order.customerEmail}</div>
            )}
            {order.deliveryAddress && (
              <div className="flex items-start gap-2 text-[#5C645F] text-xs pt-1">
                <MapPin className="w-4 h-4 text-[#88918C] shrink-0 mt-0.5" />
                <span>{order.deliveryAddress}</span>
              </div>
            )}
            {order.notes && (
              <div className="p-3 bg-[#FAF9F5] rounded text-xs text-[#5C645F] border border-[#E2E0D8] mt-2">
                <span className="font-semibold text-[#252A27]">Internal Notes:</span>
                <p className="mt-0.5 whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* 50/50 Financial Cards */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-[#E2E0D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#88918C] uppercase tracking-wider">
              50/50 Payment Breakdown
            </h2>
            <div className="text-sm font-bold text-[#252A27]">
              Total: ₦{Number(order.totalAmount).toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Deposit Box */}
            <div
              className={`p-4 rounded-xl border ${
                isDepositVerified
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-rose-50/50 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#5C645F]">50% Deposit (Before Production)</span>
                {isDepositVerified ? (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    VERIFIED
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                    PENDING
                  </span>
                )}
              </div>
              <div className="text-xl font-bold text-[#252A27] mt-1">
                ₦{Number(order.depositRequired).toLocaleString()}
              </div>
              <div className="text-xs text-[#5C645F] mt-1">
                Paid: <span className="font-semibold">₦{Number(order.depositPaid).toLocaleString()}</span>
              </div>
            </div>

            {/* Balance Box */}
            <div
              className={`p-4 rounded-xl border ${
                isPaidInFull
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-amber-50/50 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#5C645F]">50% Balance (Before Release)</span>
                {isPaidInFull ? (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    VERIFIED
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    DUE AT PARK
                  </span>
                )}
              </div>
              <div className="text-xl font-bold text-[#252A27] mt-1">
                ₦{Number(order.balanceRequired).toLocaleString()}
              </div>
              <div className="text-xs text-[#5C645F] mt-1">
                Paid: <span className="font-semibold">₦{Number(order.balancePaid).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ORDER ITEMS TABLE
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-[#E2E0D8] shadow-sm overflow-hidden">
        <div className="p-4 bg-[#FAF9F5] border-b border-[#E2E0D8] flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#5C645F] uppercase tracking-wider">
            Agreed Order Items Snapshot
          </h2>
          <span className="text-xs text-[#88918C]">{order.items?.length || 0} line item(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E2E0D8] text-xs font-semibold text-[#5C645F] uppercase bg-white">
                <th className="py-3 px-4 sm:px-6">Product / Specification</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 sm:px-6 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E0D8]">
              {order.items?.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF9F5]/70">
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="font-medium text-[#252A27]">{item.productName}</div>
                    {item.specifications && (
                      <div className="text-xs text-[#5C645F] mt-0.5">{item.specifications}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    ₦{Number(item.unitPrice).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-semibold text-[#252A27]">
                    ₦{Number(item.lineTotal).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#FAF9F5] font-semibold text-sm">
                <td colSpan={3} className="py-3 px-4 sm:px-6 text-right text-[#5C645F]">
                  Subtotal:
                </td>
                <td className="py-3 px-4 sm:px-6 text-right font-mono text-[#252A27]">
                  ₦{Number(order.subtotal).toLocaleString()}
                </td>
              </tr>
              {Number(order.discount) > 0 && (
                <tr className="bg-[#FAF9F5] font-semibold text-sm">
                  <td colSpan={3} className="py-2 px-4 sm:px-6 text-right text-rose-600">
                    Discount:
                  </td>
                  <td className="py-2 px-4 sm:px-6 text-right font-mono text-rose-600">
                    -₦{Number(order.discount).toLocaleString()}
                  </td>
                </tr>
              )}
              <tr className="bg-[#FAF9F5] font-bold text-base border-t border-[#E2E0D8]">
                <td colSpan={3} className="py-3 px-4 sm:px-6 text-right text-[#252A27]">
                  Total Order Amount:
                </td>
                <td className="py-3 px-4 sm:px-6 text-right font-mono text-[#246B45]">
                  ₦{Number(order.totalAmount).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* =========================================================================
          PAYMENTS AUDIT LEDGER
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-[#E2E0D8] shadow-sm overflow-hidden">
        <div className="p-4 bg-[#FAF9F5] border-b border-[#E2E0D8] flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#5C645F] uppercase tracking-wider">
            Payment Audit & Verification Ledger
          </h2>
          <button
            onClick={() => {
              setActionError(null);
              setIsRecordPaymentOpen(true);
            }}
            className="text-xs font-semibold text-[#246B45] hover:underline"
          >
            + Record Payment
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E2E0D8] text-xs font-semibold text-[#5C645F] uppercase bg-white">
                <th className="py-3 px-4 sm:px-6">Type</th>
                <th className="py-3 px-4">Amount Expected / Received</th>
                <th className="py-3 px-4">Method & Reference</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E0D8]">
              {order.payments && order.payments.length > 0 ? (
                order.payments.map((p) => {
                  const expected = Number(p.amountExpected).toLocaleString();
                  const received = p.amountReceived ? Number(p.amountReceived).toLocaleString() : null;

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF9F5]/70">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-xs">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            p.paymentType === 'DEPOSIT'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {p.paymentType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-[#252A27]">
                          ₦{received || expected}
                        </div>
                        {received && received !== expected && (
                          <div className="text-[11px] text-[#88918C]">Expected: ₦{expected}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-[#252A27]">{p.paymentMethod || '—'}</div>
                        {p.paymentReference && (
                          <div className="font-mono text-[11px] text-[#5C645F]">
                            Ref: {p.paymentReference}
                          </div>
                        )}
                        {p.customerClaimRef && (
                          <div className="font-mono text-[11px] text-[#88918C]">
                            Claim: {p.customerClaimRef}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        {p.status === 'VERIFIED' ? (
                          <div>
                            <span className="font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </span>
                            {p.verifiedBy && (
                              <div className="text-[10px] text-[#5C645F]">by {p.verifiedBy.name}</div>
                            )}
                          </div>
                        ) : p.status === 'REJECTED' ? (
                          <span className="font-semibold text-rose-700 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        ) : p.status === 'SUBMITTED' ? (
                          <span className="font-semibold text-amber-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Submitted (Awaiting Verification)
                          </span>
                        ) : (
                          <span className="text-[#88918C]">Pending</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        {p.status !== 'VERIFIED' && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleVerifyPayment(p.id, 'VERIFIED')}
                              disabled={isSubmitting}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerifyPayment(p.id, 'REJECTED')}
                              disabled={isSubmitting}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-[#88918C]">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL: RECORD PAYMENT
          ========================================================================= */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E0D8]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E0D8]">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#246B45]" />
                <h3 className="font-semibold text-base text-[#252A27]">Record Payment</h3>
              </div>
              <button
                onClick={() => setIsRecordPaymentOpen(false)}
                className="text-[#88918C] hover:text-[#252A27] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Payment Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={paymentForm.paymentType}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      paymentType: e.target.value as any,
                      amountReceived:
                        e.target.value === 'DEPOSIT'
                          ? Number(order.depositRequired)
                          : Number(order.balanceRequired),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                >
                  <option value="DEPOSIT">50% Deposit (Production authorization)</option>
                  <option value="BALANCE">50% Balance (Park release authorization)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Amount Received (₦) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={paymentForm.amountReceived}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      amountReceived: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Payment Method <span className="text-rose-500">*</span>
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="POS / Card">POS / Card</option>
                  <option value="Cash Deposit">Cash Deposit</option>
                  <option value="Cheque">Bank Draft / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Bank Reference / Teller Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. TRF-928190284"
                  value={paymentForm.paymentReference || ''}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, paymentReference: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Paid into GTBank business account"
                  value={paymentForm.internalNotes || ''}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, internalNotes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E0D8]">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
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
                  Submit Payment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DISPATCH TO TRANSPORT PARK
          ========================================================================= */}
      {isDispatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E0D8]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E0D8]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-600" />
                <h3 className="font-semibold text-base text-[#252A27]">Dispatch Order (Waybill)</h3>
              </div>
              <button
                onClick={() => setIsDispatchOpen(false)}
                className="text-[#88918C] hover:text-[#252A27] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Transport Company / Line <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Young Shall Grow / GUO / Libra / Ekeson"
                  value={dispatchForm.transportCompany || ''}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, transportCompany: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Park Destination / Station <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upper Iweka Park, Onitsha"
                  value={dispatchForm.parkDestination || ''}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, parkDestination: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Waybill / Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. WB-09214"
                  value={dispatchForm.waybillNumber || ''}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, waybillNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mallam Sani"
                    value={dispatchForm.driverName || ''}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, driverName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                    Driver Phone
                  </label>
                  <input
                    type="text"
                    placeholder="08098765432"
                    value={dispatchForm.driverPhone || ''}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, driverPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Vehicle Plate Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. KSF-492-XA"
                  value={dispatchForm.vehiclePlate || ''}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, vehiclePlate: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E0D8]">
                <button
                  type="button"
                  onClick={() => setIsDispatchOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#5C645F] hover:bg-[#F5F4EF] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RECORD PARK ARRIVAL CONFIRMATION
          ========================================================================= */}
      {isParkArrivalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E0D8]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E0D8]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-base text-[#252A27]">
                  Record Park Arrival Confirmation
                </h3>
              </div>
              <button
                onClick={() => setIsParkArrivalOpen(false)}
                className="text-[#88918C] hover:text-[#252A27] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                CRITICAL BUSINESS RULE:
              </span>
              <p>
                Driver arrival confirmation at the transport park does <strong>NOT</strong> mean payment! Goods will remain held at the park until the customer pays the remaining 50% balance and staff authorizes release.
              </p>
            </div>

            <form onSubmit={handleParkArrivalSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Confirmer / Driver Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Driver Mallam Sani or Park Clerk"
                  value={parkArrivalForm.arrivalConfirmerName}
                  onChange={(e) =>
                    setParkArrivalForm({
                      ...parkArrivalForm,
                      arrivalConfirmerName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Arrival Notes / Bay Location
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Van safely parked at Shed 4. Customer contacted to settle balance."
                  value={parkArrivalForm.arrivalNotes}
                  onChange={(e) =>
                    setParkArrivalForm({
                      ...parkArrivalForm,
                      arrivalNotes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E0D8]">
                <button
                  type="button"
                  onClick={() => setIsParkArrivalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#5C645F] hover:bg-[#F5F4EF] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Arrival at Park
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: AUTHORIZE RELEASE OF GOODS
          ========================================================================= */}
      {isAuthorizeReleaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E0D8]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E0D8]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-base text-[#252A27]">
                  Authorize Park Release
                </h3>
              </div>
              <button
                onClick={() => setIsAuthorizeReleaseOpen(false)}
                className="text-[#88918C] hover:text-[#252A27] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                FULL 100% PAYMENT VERIFIED:
              </span>
              <p>
                Both the 50% deposit and 50% balance have been verified. Authorizing release instructs the driver or destination park to hand over all goods to the customer.
              </p>
            </div>

            <form onSubmit={handleAuthorizeReleaseSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Release Notes / Verification Reference
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Balance verified in bank account. Driver given release pin/authorization."
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E0D8]">
                <button
                  type="button"
                  onClick={() => setIsAuthorizeReleaseOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#5C645F] hover:bg-[#F5F4EF] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Authorize Release Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
