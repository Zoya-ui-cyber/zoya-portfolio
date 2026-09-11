export type Language = "zh" | "en";

export type LocalizedText = {
  zh: string;
  en: string;
};

export type ProjectCategory =
  | "architecture"
  | "urban"
  | "spatial"
  | "installation"
  | "digital"
  | "visual"
  | "3d"
  | "aigc"
  | "ui"
  | "research";

export type Project = {

  collection: "selected" | "digital" | "archive";

  mode?: "custom" | "pdf";

  pages?: { src: string; width: number; height: number }[];

  slug: string;

  title: LocalizedText;

  subtitle?: LocalizedText;

  year: number;

  category: ProjectCategory[];

  projectType: LocalizedText;

  role?: LocalizedText;

  instructors?: string[];

  period?: string;

  description?: LocalizedText;

  cover: string;

  featured?: boolean;

  order: number;
};