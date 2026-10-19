import { enquiryRepository, CreateEnquiryItemRecordData, CreateEnquiryRecordData } from '../repositories/enquiry.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { 
  generateEnquiryReference, 
  generateTrackingToken, 
  hashTrackingToken, 
  maskCustomerName 
} from '../utils/reference.js';
import { 
  CreateEnquiryInput, 
  AdminListEnquiriesQuery, 
  AdminUpdateEnquiryStatusInput, 
  AdminCreateEnquiryNoteInput, 
  AdminUpdateEnquiryNoteInput 
} from '../schemas/enquiry.schema.js';
import { CustomerType, EnquiryType, EnquiryStatus, AdminRole } from '@prisma/client';
import { AppError } from '../types/api.js';

export class EnquiryServiceError extends AppError {
  constructor(message: string, code: string, status: number = 400, details?: any) {
    super(message, status, code, details);
    this.name = 'EnquiryServiceError';
  }
}

export const enquiryService = {
  /**
   * Process and persist a public customer enquiry (quote request or general contact).
   */
  async submitPublicEnquiry(input: CreateEnquiryInput) {
    const rawItems = input.items || [];
    const resolvedItems: CreateEnquiryItemRecordData[] = [];

    // Resolve and validate any requested product items
    for (const item of rawItems) {
      let resolvedProductId: string | null = null;
      let resolvedProductName = item.productName || (item as any).requestedProductName || 'Packaging Item';
      let resolvedProductSlug: string | null = item.productSlug || null;

      // If productId or productSlug was supplied, resolve authoritative product from DB
      if (item.productId || item.productSlug) {
        let product = null;
        if (item.productId) {
          product = await productRepository.findById(item.productId);
        } else if (item.productSlug) {
          product = await productRepository.findBySlug(item.productSlug, { includeHiddenCategories: true });
        }

        if (!product) {
          throw new EnquiryServiceError(
            `Referenced product "${item.productSlug || item.productId}" was not found or is unavailable.`,
            'INVALID_PRODUCT_REFERENCE',
            400
          );
        }

        // Check product visibility
        if (product.category && product.category.visibility === 'HIDDEN') {
          throw new EnquiryServiceError(
            `Referenced product is currently not available for quotation.`,
            'PRODUCT_UNAVAILABLE',
            400
          );
        }

        resolvedProductId = product.id;
        resolvedProductName = product.name;
        resolvedProductSlug = product.slug;
      }

      resolvedItems.push({
        productId: resolvedProductId,
        productName: resolvedProductName,
        productSlug: resolvedProductSlug,
        quantity: item.quantity,
        unit: item.unit || 'pieces',
        size: item.size,
        gauge: item.gauge,
        color: item.color,
        customPrinting: item.customPrinting,
        specifications: item.specifications,
      });
    }

    // Derive intelligent subject line if not supplied
    let subject = input.subject?.trim();
    if (!subject) {
      if (resolvedItems.length > 0) {
        subject = `Quote for ${resolvedItems[0].productName}${
          resolvedItems.length > 1 ? ` (+${resolvedItems.length - 1} more)` : ''
        }`;
      } else if (input.enquiryType === 'QUOTE_CUSTOM') {
        subject = 'Custom Packaging Specification Request';
      } else {
        subject = 'General Website Enquiry';
      }
    }

    // Generate safe, collision-resistant reference
    let reference = generateEnquiryReference();
    let collisionRetries = 0;
    while ((await enquiryRepository.findByReference(reference)) && collisionRetries < 5) {
      reference = generateEnquiryReference();
      collisionRetries++;
    }

    // Generate cryptographically secure tracking token and its one-way hash
    const rawTrackingToken = generateTrackingToken();
    const trackingTokenHash = hashTrackingToken(rawTrackingToken);

    // Primary single-product compatibility fields
    const primaryItem = resolvedItems[0] || null;

    const recordData: CreateEnquiryRecordData = {
      reference,
      trackingTokenHash,
      customerName: input.customerName.trim(),
      businessName: input.businessName?.trim() || null,
      customerPhone: input.customerPhone.trim(),
      customerEmail: input.customerEmail?.trim() || null,
      customerType: input.customerType as CustomerType,
      enquiryType: input.enquiryType as EnquiryType,
      subject,
      customerMessage: input.customerMessage?.trim() || null,
      source: input.source?.trim() || 'WEBSITE',
      status: EnquiryStatus.NEW,
      productId: primaryItem?.productId || null,
      requestedProductName: primaryItem?.productName || null,
      requestedQuantity: primaryItem?.quantity ? String(primaryItem.quantity) : null,
      requestedUnit: primaryItem?.unit || null,
      specifications: primaryItem?.specifications || null,
    };

    const enquiry = await enquiryRepository.createEnquiry(recordData, resolvedItems);

    // Return safe public confirmation without internal UUIDs or staff fields
    return {
      reference: enquiry.reference,
      trackingToken: rawTrackingToken,
      trackingUrl: `/track-enquiry?token=${rawTrackingToken}`,
      customerName: enquiry.customerName,
      enquiryType: enquiry.enquiryType,
      status: enquiry.status,
      statusTitle: 'Enquiry Received',
      statusDescription: 'We have received your enquiry. Our production and sales team will review your requirements.',
      message: 'Your packaging enquiry has been successfully received. Please retain your reference number for follow-up.',
      createdAt: enquiry.createdAt,
      items: resolvedItems.map((item) => ({
        productName: item.productName,
        productSlug: item.productSlug,
        quantity: item.quantity,
        unit: item.unit,
        size: item.size,
        gauge: item.gauge,
        color: item.color,
        customPrinting: item.customPrinting,
      })),
    };
  },

  /**
   * Administrative enquiry listing with search, filtering, and pagination.
   */
  async listAdminEnquiries(query: AdminListEnquiriesQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    let status: EnquiryStatus | undefined;
    if (query.status && query.status.toLowerCase() !== 'all') {
      status = query.status.toUpperCase().replace(/-/g, '_') as EnquiryStatus;
    }

    let enquiryType: EnquiryType | undefined;
    if (query.type && query.type.toLowerCase() !== 'all') {
      enquiryType = query.type.toUpperCase().replace(/-/g, '_') as EnquiryType;
    }

    let startDate: Date | undefined;
    if (query.startDate) {
      startDate = new Date(query.startDate);
    }

    let endDate: Date | undefined;
    if (query.endDate) {
      endDate = new Date(query.endDate);
    }

    const { total, enquiries } = await enquiryRepository.listEnquiries(
      {
        status,
        enquiryType,
        search: query.search,
        startDate,
        endDate,
      },
      page,
      limit,
      query.sort || 'newest'
    );

    const totalPages = Math.ceil(total / limit) || 1;

    // Ensure internalNotes are completely omitted from list responses
    const sanitizedEnquiries = enquiries.map((enq) => {
      const { internalNotes, ...safeEnquiry } = enq;
      return safeEnquiry;
    });

    return {
      enquiries: sanitizedEnquiries,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  /**
   * Administrative enquiry detail retrieval (includes items and private notes).
   */
  async getAdminEnquiryById(id: string) {
    const enquiry = await enquiryRepository.findById(id, true);
    if (!enquiry) {
      throw new EnquiryServiceError(`Enquiry with ID "${id}" was not found.`, 'ENQUIRY_NOT_FOUND', 404);
    }
    return enquiry;
  },

  /**
   * Update enquiry status.
   */
  async updateEnquiryStatus(id: string, input: AdminUpdateEnquiryStatusInput) {
    const existing = await enquiryRepository.findById(id);
    if (!existing) {
      throw new EnquiryServiceError(`Enquiry with ID "${id}" was not found.`, 'ENQUIRY_NOT_FOUND', 404);
    }

    const updated = await enquiryRepository.updateStatus(id, input.status as EnquiryStatus);
    return updated;
  },

  /**
   * List staff notes for an enquiry.
   */
  async listEnquiryNotes(enquiryId: string) {
    const existing = await enquiryRepository.findById(enquiryId);
    if (!existing) {
      throw new EnquiryServiceError(`Enquiry with ID "${enquiryId}" was not found.`, 'ENQUIRY_NOT_FOUND', 404);
    }

    return enquiryRepository.listNotes(enquiryId);
  },

  /**
   * Create an internal staff note.
   */
  async createEnquiryNote(enquiryId: string, authorId: string, input: AdminCreateEnquiryNoteInput) {
    const existing = await enquiryRepository.findById(enquiryId);
    if (!existing) {
      throw new EnquiryServiceError(`Enquiry with ID "${enquiryId}" was not found.`, 'ENQUIRY_NOT_FOUND', 404);
    }

    const note = await enquiryRepository.createNote(enquiryId, authorId, input.content.trim());
    return note;
  },

  /**
   * Update an internal staff note.
   */
  async updateEnquiryNote(
    enquiryId: string,
    noteId: string,
    userId: string,
    userRole: AdminRole,
    input: AdminUpdateEnquiryNoteInput
  ) {
    const note = await enquiryRepository.findNoteById(noteId);
    if (!note || note.enquiryId !== enquiryId) {
      throw new EnquiryServiceError(`Note with ID "${noteId}" was not found on this enquiry.`, 'NOTE_NOT_FOUND', 404);
    }

    // Role check: Only the note's original author or an ADMIN / SUPERADMIN can edit the note
    const isAuthor = note.authorId === userId;
    const isElevated = userRole === AdminRole.ADMIN || userRole === AdminRole.SUPERADMIN;

    if (!isAuthor && !isElevated) {
      throw new EnquiryServiceError('You do not have permission to edit this note.', 'FORBIDDEN', 403);
    }

    const updated = await enquiryRepository.updateNote(noteId, input.content.trim());
    return updated;
  },

  /**
   * Delete an internal staff note.
   */
  async deleteEnquiryNote(
    enquiryId: string,
    noteId: string,
    userId: string,
    userRole: AdminRole
  ) {
    const note = await enquiryRepository.findNoteById(noteId);
    if (!note || note.enquiryId !== enquiryId) {
      throw new EnquiryServiceError(`Note with ID "${noteId}" was not found on this enquiry.`, 'NOTE_NOT_FOUND', 404);
    }

    const isAuthor = note.authorId === userId;
    const isElevated = userRole === AdminRole.ADMIN || userRole === AdminRole.SUPERADMIN;

    if (!isAuthor && !isElevated) {
      throw new EnquiryServiceError('You do not have permission to delete this note.', 'FORBIDDEN', 403);
    }

    await enquiryRepository.deleteNote(noteId);
    return { success: true, deletedNoteId: noteId };
  },

  /**
   * Maps internal administrative statuses to customer-friendly descriptions and progress steps.
   */
  mapCustomerVisibleStatus(status: EnquiryStatus) {
    switch (status) {
      case EnquiryStatus.NEW:
        return {
          statusCode: 'received' as const,
          statusTitle: 'Enquiry Received',
          statusDescription: 'We have received your enquiry and our production team is reviewing your specifications.',
          stepNumber: 1,
        };
      case EnquiryStatus.IN_REVIEW:
        return {
          statusCode: 'under_review' as const,
          statusTitle: 'Under Technical Review',
          statusDescription: 'Our packaging specialists are reviewing your requested dimensions, gauge thickness, and order volumes.',
          stepNumber: 2,
        };
      case EnquiryStatus.CONTACTED:
        return {
          statusCode: 'follow_up_in_progress' as const,
          statusTitle: 'Follow-up in Progress',
          statusDescription: 'Our sales representative has initiated follow-up communication to clarify details and coordinate your requirements.',
          stepNumber: 3,
        };
      case EnquiryStatus.QUOTED:
        return {
          statusCode: 'quotation_prepared' as const,
          statusTitle: 'Quotation Prepared',
          statusDescription: 'Your formal pricing estimation has been prepared and communicated through your designated contact channel.',
          stepNumber: 4,
        };
      case EnquiryStatus.CLOSED:
        return {
          statusCode: 'closed' as const,
          statusTitle: 'Enquiry Closed',
          statusDescription: 'This enquiry has been completed or archived. You are welcome to submit a new enquiry at any time.',
          stepNumber: 5,
        };
      default:
        return {
          statusCode: 'received' as const,
          statusTitle: 'Enquiry Received',
          statusDescription: 'We have received your enquiry.',
          stepNumber: 1,
        };
    }
  },

  /**
   * Public customer enquiry tracking by secure tracking token.
   * Authenticates access strictly via cryptographic token hash.
   * Never exposes internal notes, database IDs, or privileged staff details.
   */
  async trackEnquiry(token: string) {
    if (!token || typeof token !== 'string' || token.trim().length < 32) {
      throw new EnquiryServiceError(
        'The tracking credential provided is invalid or malformed.',
        'INVALID_TRACKING_CREDENTIAL',
        400
      );
    }

    const hash = hashTrackingToken(token);
    const enquiry = await enquiryRepository.findByTrackingTokenHash(hash);

    if (!enquiry) {
      throw new EnquiryServiceError(
        'Tracking information could not be found for the provided credential. Please check your tracking link or access key.',
        'ENQUIRY_NOT_FOUND',
        404
      );
    }

    const statusInfo = this.mapCustomerVisibleStatus(enquiry.status);

    return {
      reference: enquiry.reference,
      createdAt: enquiry.createdAt,
      updatedAt: enquiry.updatedAt,
      enquiryType: enquiry.enquiryType.toLowerCase(),
      subject: enquiry.subject,
      status: statusInfo.statusCode,
      statusTitle: statusInfo.statusTitle,
      statusDescription: statusInfo.statusDescription,
      stepNumber: statusInfo.stepNumber,
      totalSteps: 4,
      customerName: maskCustomerName(enquiry.customerName),
      businessName: enquiry.businessName,
      customerMessage: enquiry.customerMessage,
      items: (enquiry.items || []).map((item) => ({
        productName: item.productName,
        requestedProductName: item.productName,
        productSlug: item.productSlug,
        quantity: item.quantity,
        unit: item.unit,
        size: item.size,
        gauge: item.gauge,
        color: item.color,
        customPrinting: item.customPrinting,
      })),
      order: (enquiry as any).orders?.[0]
        ? {
            orderNumber: (enquiry as any).orders[0].orderNumber,
            status: (enquiry as any).orders[0].status,
            paymentStatus: (enquiry as any).orders[0].paymentStatus,
            productionStatus: (enquiry as any).orders[0].productionStatus,
            totalAmount: (enquiry as any).orders[0].totalAmount,
            depositRequired: (enquiry as any).orders[0].depositRequired,
            balanceRequired: (enquiry as any).orders[0].balanceRequired,
            depositPaid: (enquiry as any).orders[0].depositPaid,
            balancePaid: (enquiry as any).orders[0].balancePaid,
            dispatch: (enquiry as any).orders[0].dispatch,
          }
        : null,
    };
  },
};
