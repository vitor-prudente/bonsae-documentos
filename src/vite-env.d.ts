/// <reference types="vite/client" />

declare module "html2pdf.js" {
  interface Html2PdfBuilder {
    set(options: Record<string, unknown>): Html2PdfBuilder;
    from(source: HTMLElement): Html2PdfBuilder;
    save(): Promise<void>;
  }

  type Html2PdfFactory = () => Html2PdfBuilder;

  const html2pdf: Html2PdfFactory;
  export default html2pdf;
}
