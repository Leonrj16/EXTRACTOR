export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqBlockMeta {
  items?: FaqItem[];
}
