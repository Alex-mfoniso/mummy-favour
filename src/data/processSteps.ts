import { ProcessStep } from '@/types';

export const GET_STARTED_STEPS: ProcessStep[] = [
  {
    stepNumber: '01',
    title: 'Explore Products',
    description: 'Browse the available product range to discover the bag styles, film rolls, and sack types that match your packaging requirements.',
    actionLabel: 'Browse Products',
    actionHref: '/products',
  },
  {
    stepNumber: '02',
    title: 'Share Your Requirements',
    description: 'Tell us what you need, including quantity, intended use, and specific dimensions or thickness where applicable.',
    actionLabel: 'Start Quotation Form',
    actionHref: '/request-quote',
  },
  {
    stepNumber: '03',
    title: 'Receive a Response',
    description: 'Contact the Divine Favour team to discuss availability and pricing based on your specified order requirements.',
    actionLabel: 'Contact Information',
    actionHref: '/contact',
  },
];
