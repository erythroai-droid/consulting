// Site content that is not translated text: contacts, catalog rows, media paths.
// the company name is shown in English in both languages
export const BRAND = 'PSB';
export const BRAND_FULL = 'PSB Consulting';

/** Catalog prices are in US dollars (demo values, the mockup's 5 000 ₽ rows are placeholders). */
export const CURRENCY = 'USD';

export const PHONE = { label: '+7 963 04-80-28', href: 'tel:+7963048028' };
// address as given in the Figma mockup (placeholder, replace with the real office)
export const ADDRESS = '40 Baria Street 133/2, New York City, US';
export const MAP_URL = 'https://yandex.ru/maps/?text=' + encodeURIComponent(ADDRESS);

export const pad = (n: number) => String(n).padStart(2, '0');

/** Header / drawer navigation: [section hash, title key, caption key] */
export const NAV = [
  { href: '#about', t: 'nav_about', s: 'nav_about_s' },
  { href: '#services', t: 'nav_services', s: 'nav_services_s' },
  { href: '#reviews', t: 'nav_reviews', s: 'nav_reviews_s' },
  { href: '#catalog', t: 'nav_price', s: 'nav_price_s' },
  { href: '#contacts', t: 'nav_contacts', s: 'nav_contacts_s' },
] as const;

export const FOOTER_NAV = [
  { href: '#about', t: 'nav_about' },
  { href: '#services', t: 'nav_services' },
  { href: '#about', t: 'f_team' },
  { href: '#reviews', t: 'nav_reviews' },
  { href: '#catalog', t: 'nav_price' },
  { href: '#contacts', t: 'nav_contacts' },
] as const;

export const HERO = [
  { src: '/img/hero-4.webp', small: '/img/hero-4-960.webp', w: 1920, h: 1281, h1: 'hero1_a', h2: 'hero1_b' },
  { src: '/img/hero-5.webp', small: '/img/hero-5-960.webp', w: 1920, h: 1281, h1: 'hero2_a', h2: 'hero2_b' },
  { src: '/img/hero-3.webp', small: '/img/hero-3-960.webp', w: 1200, h: 896, h1: 'hero3_a', h2: 'hero3_b' },
] as const;

export const SERVICES = [
  { icon: '/icons/folder.svg', t: 'srv1', p: 'srv1_p', href: '#catalog' },
  { icon: '/icons/stamp.svg', t: 'srv2', p: 'srv2_p', href: '#contacts' },
  { icon: '/icons/documents.svg', t: 'srv3', p: 'srv3_p', href: '#contacts' },
  { icon: '/icons/correct.svg', t: 'srv4', p: 'srv4_p', href: '#contacts' },
  { icon: '/icons/usb.svg', t: 'srv5', p: 'srv5_p', href: '#contacts' },
] as const;

/** Demo catalog rows (the mockup repeats one row; replace with the real catalog). acc = key of the account text. */
export const FIRMS = [
  { no: '006813', name: 'Bradberry', ifns: '7455', q: 1, year: 2019, okved: '41.20', acc: 'acc_none', price: 60 },
  { no: '006814', name: 'Vectors Group', ifns: '7714', q: 2, year: 2019, okved: '46.90', acc: 'acc_vtb', price: 60 },
  { no: '006815', name: 'Remstroypro', ifns: '7725', q: 3, year: 2019, okved: '43.30', acc: 'acc_none', price: 60 },
  { no: '006816', name: 'Agromarket', ifns: '7736', q: 4, year: 2019, okved: '01.11', acc: 'acc_sber', price: 60 },
  { no: '006817', name: 'Nord Logistic', ifns: '7743', q: 1, year: 2020, okved: '49.41', acc: 'acc_none', price: 60 },
  { no: '006818', name: 'Alfa Trade', ifns: '7751', q: 2, year: 2020, okved: '47.19', acc: 'acc_vtb', price: 60 },
] as const;

export const REVIEWS = [
  { img: '/img/client-1.webp', w: 396, h: 399, name: 'rv1_name', role: 'rv1_role', text: 'rv1_text' },
  { img: '/img/client-2.webp', w: 800, h: 800, name: 'rv2_name', role: 'rv2_role', text: 'rv2_text' },
  { img: '/img/client-3.webp', w: 800, h: 800, name: 'rv3_name', role: 'rv3_role', text: 'rv3_text' },
] as const;

export const PARTNERS = [
  { src: '/img/logos/1.jpg', alt: 'Arrow', w: 150, h: 95 },
  { src: '/img/logos/2.jpg', alt: 'Growth', w: 150, h: 95 },
  { src: '/img/logos/3.jpg', alt: 'Rawilly', w: 150, h: 95 },
  { src: '/img/logos/4.jpg', alt: 'Lambo', w: 150, h: 95 },
  { src: '/img/logos/5.jpg', alt: 'Connect', w: 150, h: 95 },
  { src: '/img/logos/6.jpg', alt: 'Star', w: 150, h: 95 },
  { src: '/img/logos/7.jpg', alt: 'Aesthetic', w: 150, h: 95 },
  { src: '/img/logos/8.jpg', alt: 'M', w: 150, h: 95 },
] as const;
