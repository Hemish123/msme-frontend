import { Trash2 } from 'lucide-react';

export default function InvoiceItemRow({ item, index, products, onChange, onRemove }) {
  const handleProductChange = (e) => {
    const productId = e.target.value;
    if (!productId) {
      onChange(index, { ...item, inventory_item: '', description: '', hsn_code: '', unit: '', unit_price: 0, tax_percentage: 0 });
      return;
    }
    const p = products.find((pr) => String(pr.id) === String(productId));
    if (p) {
      onChange(index, {
        ...item,
        inventory_item: p.id,
        description: p.product_name,
        hsn_code: p.hsn_code,
        unit: p.unit,
        unit_price: parseFloat(p.unit_price),
        tax_percentage: parseInt(p.tax_percentage),
      });
    }
  };

  const handleChange = (field, value) => {
    onChange(index, { ...item, [field]: value });
  };

  const qty = parseFloat(item.quantity) || 0;
  const price = parseFloat(item.unit_price) || 0;
  const tax = parseFloat(item.tax_percentage) || 0;
  const lineBase = qty * price;
  const lineTax = lineBase * (tax / 100);
  const lineAmount = lineBase + lineTax;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
      <td className="px-2 py-2">
        <select
          value={item.inventory_item || ''}
          onChange={handleProductChange}
          className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"
        >
          <option value="">-- Select Product --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.product_name}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2">
        <input
          type="text"
          value={item.note_for_product || ''}
          onChange={(e) => handleChange('note_for_product', e.target.value)}
          placeholder="Note"
          className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="text"
          value={item.hsn_code || ''}
          onChange={(e) => handleChange('hsn_code', e.target.value)}
          className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:border-indigo-400"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 1)}
          className="w-20 border border-slate-200 rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:border-indigo-400"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="text"
          value={item.unit || ''}
          onChange={(e) => handleChange('unit', e.target.value)}
          className="w-16 border border-slate-200 rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:border-indigo-400"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          value={item.unit_price}
          onChange={(e) => handleChange('unit_price', parseFloat(e.target.value) || 0)}
          className="w-24 border border-slate-200 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:border-indigo-400"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          value={item.tax_percentage}
          onChange={(e) => handleChange('tax_percentage', parseInt(e.target.value) || 0)}
          className="w-16 border border-slate-200 rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:border-indigo-400"
        />
      </td>
      <td className="px-2 py-2 text-right text-sm font-semibold text-slate-700">
        ₹{lineAmount.toFixed(2)}
      </td>
      <td className="px-2 py-2 text-center">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
