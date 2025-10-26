'use client';

interface AmountInputProps {
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AmountInput({ value, error, onChange }: AmountInputProps) {
  return (
    <div>
      <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-2">
        Amount ($)
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-500">$</span>
        </div>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          value={value}
          onChange={onChange}
          className={`block w-full pl-8 py-3 pr-4 rounded-lg border ${
            error ? 'border-red-300 bg-red-50' : 'border-slate-200'
          } focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-colors duration-200`}
          placeholder="0.00"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}