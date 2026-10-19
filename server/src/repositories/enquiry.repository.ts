import { prisma } from '../lib/prisma.js';
import { CustomerType, EnquiryType, EnquiryStatus, Prisma } from '@prisma/client';

export interface CreateEnquiryRecordData {
  reference: string;
  trackingTokenHash?: string | null;
  customerName: string;
  businessName?: string | null;
  customerPhone: string;
  customerEmail?: string | null;
  customerType: CustomerType;
  enquiryType: EnquiryType;
  subject?: string | null;
  customerMessage?: string | null;
  source?: string;
  status?: EnquiryStatus;
  productId?: string | null;
  requestedProductName?: string | null;
  requestedQuantity?: string | null;
  requestedUnit?: string | null;
  specifications?: any;
}

export interface CreateEnquiryItemRecordData {
  productId?: string | null;
  productName: string;
  productSlug?: string | null;
  quantity?: number | null;
  unit?: string | null;
  size?: string | null;
  gauge?: string | null;
  color?: string | null;
  customPrinting?: string | null;
  specifications?: any;
}

export interface ListEnquiriesFilter {
  status?: EnquiryStatus;
  enquiryType?: EnquiryType;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export const enquiryRepository = {
  /**
   * Create an Enquiry with related EnquiryItems atomically in a transaction.
   */
  async createEnquiry(
    data: CreateEnquiryRecordData,
    items: CreateEnquiryItemRecordData[] = []
  ) {
    return prisma.$transaction(async (tx) => {
      const enquiry = await tx.enquiry.create({
        data: {
          reference: data.reference,
          trackingTokenHash: data.trackingTokenHash || null,
          customerName: data.customerName,
          businessName: data.businessName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          customerType: data.customerType,
          enquiryType: data.enquiryType,
          subject: data.subject,
          customerMessage: data.customerMessage,
          source: data.source || 'WEBSITE',
          status: data.status || EnquiryStatus.NEW,
          productId: data.productId,
          requestedProductName: data.requestedProductName,
          requestedQuantity: data.requestedQuantity,
          requestedUnit: data.requestedUnit,
          specifications: data.specifications,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productSlug: item.productSlug,
              quantity: item.quantity,
              unit: item.unit,
              size: item.size,
              gauge: item.gauge,
              color: item.color,
              customPrinting: item.customPrinting,
              specifications: item.specifications,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return enquiry;
    });
  },

  /**
   * Find an enquiry by its unique reference string.
   */
  async findByReference(reference: string) {
    return prisma.enquiry.findUnique({
      where: { reference },
      include: {
        items: true,
      },
    });
  },

  /**
   * Find an enquiry by its tracking token hash for customer tracking.
   * Excludes internal staff notes.
   */
  async findByTrackingTokenHash(trackingTokenHash: string) {
    return prisma.enquiry.findUnique({
      where: { trackingTokenHash },
      include: {
        items: true,
        orders: {
          select: {
            orderNumber: true,
            status: true,
            paymentStatus: true,
            productionStatus: true,
            totalAmount: true,
            depositRequired: true,
            balanceRequired: true,
            depositPaid: true,
            balancePaid: true,
            dispatch: {
              select: {
                dispatchMethod: true,
                dispatchStatus: true,
                transportCompany: true,
                parkDestination: true,
                waybillNumber: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Find an enquiry by internal UUID, optionally including internal notes with author details.
   */
  async findById(id: string, includeNotes: boolean = false) {
    return prisma.enquiry.findUnique({
      where: { id },
      include: {
        items: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            mainImageUrl: true,
          },
        },
        ...(includeNotes
          ? {
              notes: {
                orderBy: { createdAt: 'desc' as const },
                include: {
                  author: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      role: true,
                    },
                  },
                },
              },
            }
          : {}),
      },
    });
  },

  /**
   * Paginated enquiry list for administrators (excludes internal notes).
   */
  async listEnquiries(
    filter: ListEnquiriesFilter,
    page: number = 1,
    limit: number = 20,
    sort: 'newest' | 'oldest' = 'newest'
  ) {
    const where: Prisma.EnquiryWhereInput = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.enquiryType) {
      where.enquiryType = filter.enquiryType;
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt.gte = filter.startDate;
      }
      if (filter.endDate) {
        where.createdAt.lte = filter.endDate;
      }
    }

    if (filter.search) {
      const search = filter.search.trim();
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const orderBy: Prisma.EnquiryOrderByWithRelationInput = {
      createdAt: sort === 'oldest' ? 'asc' : 'desc',
    };

    const [total, enquiries] = await Promise.all([
      prisma.enquiry.count({ where }),
      prisma.enquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          items: true,
          _count: {
            select: { notes: true },
          },
        },
      }),
    ]);

    return { total, enquiries };
  },

  /**
   * Update enquiry status.
   */
  async updateStatus(id: string, status: EnquiryStatus) {
    return prisma.enquiry.update({
      where: { id },
      data: { status },
      include: {
        items: true,
      },
    });
  },

  /**
   * Create an internal staff note.
   */
  async createNote(enquiryId: string, authorId: string | null, content: string) {
    return prisma.enquiryNote.create({
      data: {
        enquiryId,
        authorId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  },

  /**
   * Find a note by ID.
   */
  async findNoteById(noteId: string) {
    return prisma.enquiryNote.findUnique({
      where: { id: noteId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  },

  /**
   * List notes for an enquiry.
   */
  async listNotes(enquiryId: string) {
    return prisma.enquiryNote.findMany({
      where: { enquiryId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  },

  /**
   * Update an internal note.
   */
  async updateNote(noteId: string, content: string) {
    return prisma.enquiryNote.update({
      where: { id: noteId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  },

  /**
   * Delete an internal note.
   */
  async deleteNote(noteId: string) {
    return prisma.enquiryNote.delete({
      where: { id: noteId },
    });
  },
};
