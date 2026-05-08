import { useEffect, useState } from 'react';
import { getInventoryDropdown } from '../../api/inventoryAPI';

export default function ProductDropdown({ value, customerId, onChange, className = '' }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await getInventoryDropdown(customerId);
      if (data) setProducts(data);
    })();
  }, [customerId]);

  return (
    <select
      value={value || ''}
      onChange={(e) => {
        const id = e.target.value;
        const product = products.find((p) => String(p.id) === id);
        onChange(id, product);
      }}
      className={`w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white ${className}`}
    >
      <option value="">-- Select Product --</option>
      {products.map((p) => (
        <option key={p.id} value={p.id}>{p.product_name}</option>
      ))}
    </select>
  );
}
