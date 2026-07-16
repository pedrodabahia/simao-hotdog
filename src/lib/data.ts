export type Tag = "mais-vendido" | "promocao" | "novo";
export type CategorySlug =
  | "promocoes"
  | "hot-dogs"
  | "mini-pizzas"
  | "bebidas"
  | "sucos"


export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: CategorySlug;
  shortDescription: string;
  description: string;
  image: string;
  tag?: Tag;
  ingredients: string[];
  nutrition: { kcal: number; carbs: number; protein: number; fat: number };
  time: string;
};

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const categories: {
  slug: CategorySlug;
  name: string;
  emoji: string;
  image: string;
}[] = [
  { slug: "promocoes", name: "Promoções", emoji: "🔥", image: u("1550547660-d9450f859349", 400) },
  { slug: "hot-dogs", name: "Hot Dogs", emoji: "🌭", image: u("1601924582970-9238bcb495d9", 400) },
  { slug: "mini-pizzas", name: "Mini Pizzas", emoji: "🍕", image: u("1513104890138-7c749659a591", 400) },
  { slug: "bebidas", name: "Bebidas", emoji: "🥤", image: u("1622483767028-3f66f32aef97", 400) },
  { slug: "sucos", name: "Sucos", emoji: "🧃", image: u("1622543925917-763c34d1a86e", 400) },
]

export const products: Product[] = [
  {
    id: "simao-classico",
    name: "Simão Clássico",
    price: 22.9,
    category: "hot-dogs",
    shortDescription: "Pão brioche, salsicha artesanal, batata palha e cheddar cremoso.",
    description:
      "O queridinho da casa: salsicha artesanal grelhada na chapa, cheddar derretido, batata palha crocante, milho e vinagrete fresco no pão brioche macio.",
    image: u("1601924582970-9238bcb495d9"),
    tag: "mais-vendido",
    ingredients: ["Pão brioche", "Salsicha artesanal", "Cheddar", "Batata palha", "Milho", "Vinagrete"],
    nutrition: { kcal: 620, carbs: 58, protein: 24, fat: 32 },
    time: "20-30 min",
  },
  {
    id: "simao-bacon-lover",
    name: "Bacon Lover",
    price: 28.9,
    oldPrice: 34.9,
    category: "hot-dogs",
    shortDescription: "Dose dupla de bacon crocante, cheddar e cebola caramelizada.",
    description:
      "Para os fãs de bacon: dose generosa de bacon crocante, cheddar cremoso, cebola caramelizada e molho barbecue defumado, no pão brioche.",
    image: u("1573080496219-bb080dd4f877"),
    tag: "promocao",
    ingredients: ["Pão brioche", "Salsicha suína", "Bacon", "Cheddar", "Cebola caramelizada", "Barbecue"],
    nutrition: { kcal: 780, carbs: 55, protein: 34, fat: 46 },
    time: "20-30 min",
  },
  {
    id: "simao-catupiry",
    name: "Catupiry Explosion",
    price: 26.9,
    category: "hot-dogs",
    shortDescription: "Recheado com catupiry cremoso, calabresa e purê.",
    description:
      "Explosão de sabor: catupiry cremoso, calabresa fatiada na chapa, purê de batata artesanal e um toque de cheddar.",
    image: u("1626082927389-6cd097cdc6ec"),
    tag: "novo",
    ingredients: ["Pão australiano", "Salsicha tradicional", "Catupiry", "Calabresa", "Purê", "Cheddar"],
    nutrition: { kcal: 710, carbs: 62, protein: 26, fat: 38 },
    time: "20-30 min",
  },
  {
    id: "simao-vegetariano",
    name: "Verdinho do Simão",
    price: 24.9,
    category: "hot-dogs",
    shortDescription: "Salsicha vegetal, molho verde e vinagrete.",
    description: "Versão levinha com salsicha vegetal, molho verde artesanal, milho, ervilha e vinagrete.",
    image: u("1550317138-10000687a72b"),
    ingredients: ["Pão integral", "Salsicha vegetal", "Molho verde", "Milho", "Ervilha", "Vinagrete"],
    nutrition: { kcal: 480, carbs: 60, protein: 18, fat: 18 },
    time: "20-30 min",
  },

  // Mini Pizzas
  {
    id: "mini-pizza-calabresa",
    name: "Mini Pizza Calabresa",
    price: 24.9,
    category: "mini-pizzas",
    shortDescription: "Calabresa fatiada, cebola e muçarela.",
    description: "Massa fininha e crocante, molho de tomate da casa, muçarela derretida, calabresa fatiada e cebola.",
    image: u("1513104890138-7c749659a591"),
    tag: "mais-vendido",
    ingredients: ["Massa", "Molho de tomate", "Muçarela", "Calabresa", "Cebola"],
    nutrition: { kcal: 680, carbs: 74, protein: 28, fat: 30 },
    time: "20-25 min",
  },
  {
    id: "mini-pizza-mussarela",
    name: "Mini Pizza Muçarela",
    price: 21.9,
    category: "mini-pizzas",
    shortDescription: "A clássica, com bastante queijo.",
    description: "Massa fininha e crocante, molho de tomate da casa e muçarela generosa, do jeito que todo mundo gosta.",
    image: u("1548365328-9f547fb0953b"),
    ingredients: ["Massa", "Molho de tomate", "Muçarela", "Orégano"],
    nutrition: { kcal: 620, carbs: 70, protein: 26, fat: 24 },
    time: "20-25 min",
  },

  // Bebidas
  {
    id: "coca-lata",
    name: "Coca-Cola Lata 350ml",
    price: 7.5,
    category: "bebidas",
    shortDescription: "Geladinha na medida.",
    description: "Coca-Cola tradicional 350ml, geladinha.",
    image: u("1622483767028-3f66f32aef97"),
    ingredients: ["Coca-Cola 350ml"],
    nutrition: { kcal: 140, carbs: 37, protein: 0, fat: 0 },
    time: "10 min",
  },
  {
    id: "guarana-lata",
    name: "Guaraná Antarctica 350ml",
    price: 6.9,
    category: "bebidas",
    shortDescription: "Clássico brasileiro.",
    description: "Guaraná Antarctica 350ml.",
    image: u("1554866585-cd94860890b7"),
    ingredients: ["Guaraná 350ml"],
    nutrition: { kcal: 130, carbs: 34, protein: 0, fat: 0 },
    time: "10 min",
  },
  {
    id: "suco-natural",
    name: "Suco Natural 500ml",
    price: 12.9,
    category: "sucos",
    shortDescription: "Natural, feito na hora. Escolha o sabor.",
    description: "Suco natural, feito na hora, sem açúcar, 500ml. Escolha o sabor no pedido.",
    image: u("1622543925917-763c34d1a86e"),
    tag: "novo",
    ingredients: ["Fruta natural"],
    nutrition: { kcal: 210, carbs: 48, protein: 3, fat: 0 },
    time: "15 min",
  },
  {
    id: "agua",
    name: "Água Mineral 500ml",
    price: 4.5,
    category: "bebidas",
    shortDescription: "Sem gás, geladinha.",
    description: "Água mineral sem gás 500ml.",
    image: u("1546069901-ba9599a7e63c"),
    ingredients: ["Água mineral"],
    nutrition: { kcal: 0, carbs: 0, protein: 0, fat: 0 },
    time: "10 min",
  },

  // Promoções (extra)
  {
    id: "promo-terca",
    name: "Terça do Simão — Clássico + Refri",
    price: 24.9,
    oldPrice: 32.9,
    category: "promocoes",
    shortDescription: "Simão Clássico + refri lata todas as terças.",
    description: "Todas as terças: leve o Simão Clássico com refrigerante lata por um precinho especial.",
    image: u("1550317138-10000687a72b"),
    tag: "promocao",
    ingredients: ["Simão Clássico", "Refri lata"],
    nutrition: { kcal: 760, carbs: 95, protein: 24, fat: 32 },
    time: "20-30 min",
  },
];

// Personalização do lanche
export const PAO_OPTIONS = ["Tradicional", "Brioche", "Australiano", "Integral"] as const;
export const SALSICHA_OPTIONS = ["Tradicional", "Artesanal", "Suína", "Defumada"] as const;
export const MOLHOS_OPTIONS = [
  "Ketchup",
  "Mostarda",
  "Maionese",
  "Molho verde",
  "Barbecue",
  "Picante",
] as const;
export const ADICIONAIS_OPTIONS: { name: string; price: number }[] = [
  { name: "Bacon", price: 4.9 },
  { name: "Cheddar", price: 3.9 },
  { name: "Catupiry", price: 3.9 },
  { name: "Purê", price: 3.5 },
  { name: "Calabresa", price: 4.5 },
  { name: "Ovo", price: 2.9 },
  { name: "Vinagrete", price: 1.9 },
  { name: "Queijo", price: 3.5 },
  { name: "Cebola caramelizada", price: 3.9 },
];

// Personalização da mini pizza
export const TAMANHO_PIZZA_OPTIONS = ["Pequena (4 fatias)", "Média (6 fatias)", "Grande (8 fatias)"] as const;
export const BORDA_PIZZA_OPTIONS = ["Sem recheio", "Catupiry", "Cheddar", "Chocolate"] as const;

// Personalização do suco
export const SABOR_SUCO_OPTIONS = ["Laranja", "Abacaxi", "Uva", "Manga", "Morango", "Maracujá"] as const;

// Quais seções de personalização aparecem na página do produto, por categoria
export type CustomizationConfig = {
  pao: boolean;
  salsicha: boolean;
  tamanho: boolean;
  borda: boolean;
  sabor: boolean;
  molhos: boolean;
  remover: boolean;
  adicionais: boolean;
};

export const CATEGORY_CUSTOMIZATION: Record<CategorySlug, CustomizationConfig> = {
  promocoes: { pao: true, salsicha: true, tamanho: false, borda: false, sabor: false, molhos: true, remover: true, adicionais: true },
  "hot-dogs": { pao: true, salsicha: true, tamanho: false, borda: false, sabor: false, molhos: true, remover: true, adicionais: true },
  "mini-pizzas": { pao: false, salsicha: false, tamanho: true, borda: true, sabor: false, molhos: false, remover: false, adicionais: false },
  bebidas: { pao: false, salsicha: false, tamanho: false, borda: false, sabor: false, molhos: false, remover: false, adicionais: false },
  sucos: { pao: false, salsicha: false, tamanho: false, borda: false, sabor: true, molhos: false, remover: false, adicionais: false },
};

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getByCategory = (slug: CategorySlug) =>
  slug === "promocoes"
    ? products.filter((p) => p.tag === "promocao" || p.category === "promocoes")
    : products.filter((p) => p.category === slug);

export const featured = () => products.filter((p) => p.tag);
