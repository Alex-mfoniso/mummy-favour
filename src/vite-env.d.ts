/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUSINESS_WHATSAPP_NUMBER?: string;
  readonly VITE_BUSINESS_PHONE?: string;
  readonly VITE_BUSINESS_EMAIL?: string;
  readonly VITE_BUSINESS_ADDRESS?: string;
  readonly VITE_BUSINESS_MAP_URL?: string;
  readonly VITE_BUSINESS_HOURS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
