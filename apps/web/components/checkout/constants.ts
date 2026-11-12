export const TENANT_CODE = 'GLV-000001';

export const inputClassName =
    'w-full border border-(--color-border) bg-(--color-background) px-4 py-3.5 text-xs text-(--color-text) outline-none transition placeholder:text-(--color-text-muted)/60 focus:border-(--color-gold-dark) focus:ring-1 focus:ring-(--color-gold-dark)/20 sm:text-sm';

export const sectionClassName =
    'relative overflow-hidden border border-(--color-border-strong) bg-(--color-surface) p-5 sm:p-7';

export const formatPrice = (value: number) =>
    `R${Number(value || 0).toFixed(2)}`;
