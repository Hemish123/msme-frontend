import { useEffect, useState } from 'react';
import { getInvoiceCustomerDropdown } from '../../api/invoiceCustomerAPI';

export default function CustomerDropdown({ value, onChange, className = '' }) {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await getInvoiceCustomerDropdown();
      if (data) setCustomers(data);
    })();
  }, []);

  return (
    <select
      value={value || ''}
      onChange={(e) => {
        const id = e.target.value;
        const customer = customers.find((c) => String(c.id) === id);
        onChange(id, customer);
      }}
      className={`w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white ${className}`}
    >
      <option value="">-- Select Customer --</option>
      {customers.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}
