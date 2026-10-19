import React from 'react';
import { Product } from '@/types';
import { formatProductStatus } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

export interface ProductSpecificationsProps {
  product: Product;
  className?: string;
}

export const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  product,
  className = '',
}) => {
  // Collect all valid, non-empty specifications
  interface SpecItem {
    label: string;
    value: string;
  }

  const specRows: SpecItem[] = [];

  // 1. Material Formulation
  const material = product.material || product.materialGrade;
  if (material && material.trim()) {
    specRows.push({ label: 'Material Formulation', value: material.trim() });
  }

  // 2. Thickness / Micron Gauge
  if (product.thickness && product.thickness.trim()) {
    specRows.push({ label: 'Thickness / Micron Gauge', value: product.thickness.trim() });
  }

  // 3. Available Sizes / Dimensions
  if (product.dimensions && product.dimensions.length > 0) {
    const formattedDimensions = product.dimensions.filter(Boolean).join(', ');
    if (formattedDimensions) {
      specRows.push({ label: 'Available Sizes / Dimensions', value: formattedDimensions });
    }
  }

  // 4. Available Colours
  if (product.availableColors && product.availableColors.length > 0) {
    const formattedColors = product.availableColors.filter(Boolean).join(', ');
    if (formattedColors) {
      specRows.push({ label: 'Available Colours', value: formattedColors });
    }
  }

  // 5. Customization & Printing Options
  if (product.customizationOptions && product.customizationOptions.length > 0) {
    const formattedCustom = product.customizationOptions.filter(Boolean).join(', ');
    if (formattedCustom) {
      specRows.push({ label: 'Customization Options', value: formattedCustom });
    }
  }

  // 6. Minimum Order Quantity (MOQ)
  if (product.minOrderQuantity && product.minOrderQuantity.trim()) {
    specRows.push({ label: 'Minimum Order Quantity (MOQ)', value: product.minOrderQuantity.trim() });
  }

  // 7. Production Status
  if (product.status) {
    const statusInfo = formatProductStatus(product.status);
    specRows.push({ label: 'Production Availability', value: statusInfo.label });
  }

  // 8. Custom Extra Specifications from product.specifications
  if (product.specifications && product.specifications.length > 0) {
    product.specifications.forEach((extraSpec) => {
      if (extraSpec.label && extraSpec.value && extraSpec.value.trim()) {
        // Avoid duplicate labels
        const exists = specRows.some(
          (r) => r.label.toLowerCase() === extraSpec.label.toLowerCase()
        );
        if (!exists) {
          specRows.push({ label: extraSpec.label.trim(), value: extraSpec.value.trim() });
        }
      }
    });
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-[#E6E4DD] pb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#252A27]">
          Verified Technical Specifications
        </h2>
        <span className="text-[11px] text-[#5C635F]">
          Provisional Baseline
        </span>
      </div>

      {specRows.length > 0 ? (
        <div className="border border-[#D8D5CB] rounded-md overflow-hidden bg-white shadow-subtle">
          <table className="w-full text-left text-xs border-collapse">
            <tbody className="divide-y divide-[#E6E4DD]">
              {specRows.map((spec, index) => (
                <tr 
                  key={spec.label} 
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAF9F6]'}
                >
                  <th 
                    scope="row" 
                    className="py-3 px-4 font-medium text-[#5C635F] w-2/5 border-r border-[#E6E4DD]"
                  >
                    {spec.label}
                  </th>
                  <td className="py-3 px-4 font-semibold text-[#252A27]">
                    {spec.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-md flex items-center gap-3 text-xs text-[#5C635F]">
          <HelpCircle className="w-4 h-4 text-[#246B45] shrink-0" />
          <span>Contact us to confirm available specification options for this product line.</span>
        </div>
      )}

      <p className="text-[11px] text-[#88918C] leading-relaxed">
        * Specifications are tailored to commercial orders. Custom gauges, formulations, and dimensions are quoted upon request.
      </p>
    </div>
  );
};
