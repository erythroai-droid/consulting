import { Merriweather, Oswald } from "next/font/google";
import "./globals.css";

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["300", "400", "700", "900"],
  style: ["normal", "italic"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
});

export const metadata = {
  title: "ПСБ Консалтинг — бухгалтерский и юридический консалтинг",
  description:
    "Профессиональное сопровождение бизнеса. Готовые фирмы, регистрация ООО, подготовка документов и внесение изменений в ЕГРЮЛ.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${merriweather.variable} ${oswald.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
