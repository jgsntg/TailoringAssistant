'use client';

import { useState, useEffect } from 'react';

type ModelInfo = { id: string; displayName: string; vendor: 'anthropic' | 'openai' };

const STORAGE_KEY = 'resume-tailor:selected-model';

type Props = {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  label?: string;
};

export default function ModelSelector({ value, onChange, disabled, label = 'Model' }: Props) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data: { models: ModelInfo[] }) => {
        setModels(data.models);
        setLoaded(true);
        if (data.models.length === 0) return;
        const saved = localStorage.getItem(STORAGE_KEY);
        const match = saved && data.models.find((m) => m.id === saved);
        onChange(match ? match.id : data.models[0].id);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(id: string) {
    localStorage.setItem(STORAGE_KEY, id);
    onChange(id);
  }

  if (!loaded) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <div className="h-10 w-52 animate-pulse rounded-lg bg-slate-200" />
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <p className="text-sm text-red-600">No models available. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.</p>
      </div>
    );
  }

  const anthropicModels = models.filter((m) => m.vendor === 'anthropic');
  const openaiModels = models.filter((m) => m.vendor === 'openai');

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none rounded-lg border-2 border-slate-300 bg-white pl-3 pr-9 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {anthropicModels.length > 0 && (
            <optgroup label="Anthropic">
              {anthropicModels.map((m) => (
                <option key={m.id} value={m.id}>{m.displayName}</option>
              ))}
            </optgroup>
          )}
          {openaiModels.length > 0 && (
            <optgroup label="OpenAI">
              {openaiModels.map((m) => (
                <option key={m.id} value={m.id}>{m.displayName}</option>
              ))}
            </optgroup>
          )}
        </select>
        {/* Custom chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
          <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
