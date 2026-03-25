import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['zh-CN', 'en'];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./app/i18n/${locale}.json`)).default
  };
});
