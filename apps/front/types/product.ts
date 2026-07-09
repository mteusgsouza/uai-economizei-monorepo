export interface Publisher {
  id: number;
  name: string;
  category: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  categories: string[];
  authors: string[];
  tags: string[];
  publisher: Publisher;
  publication_date: string;
  label: string;
  genre: string | null;
  type_of_work: string | null;
  description: string | null;
  preview_images: string[];
  url: string;
}

export const GENRE_LABELS: Record<string, string> = {
  Fiction: "Ficcao",
  NonFiction: "Nao-Ficcao",
  ScienceFiction: "Ficcao Cientifica",
  Fantasy: "Fantasia",
  Mystery: "Misterio",
  Biography: "Biografia",
  History: "Historia",
  Romance: "Romance",
  Thriller: "Suspense",
  SelfHelp: "Autoajuda",
};

export const TYPE_OF_WORK_LABELS: Record<string, string> = {
  Book: "Livro",
  Magazine: "Revista",
  Comic: "Quadrinho",
  Audiobook: "Audiolivro",
  eBook: "eBook",
  Game: "Game",
};
