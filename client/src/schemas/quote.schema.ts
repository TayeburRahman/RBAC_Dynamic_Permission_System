export type QuoteItem = {
  name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
};

export type QuoteFormValues = {
  id?: string;
  title?: string;
  description?: string;
  items?: QuoteItem[];
  terms?: string;
  validUntil?: string;
};
