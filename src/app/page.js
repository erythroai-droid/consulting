"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import {
  animateHeroSlide,
  animateHeroTitle,
  animatePartners,
  animateReviewSwap,
  usePageMotion,
} from "./usePageMotion";

const HERO_SLIDES = [
  {
    src: "/images/hero.png",
    line1: "Бухгалтерский и юридический",
    line2: "консалтинг",
  },
  {
    src: "/images/advantages.png",
    line1: "Готовые фирмы",
    line2: "с расчётным счётом",
  },
  {
    src: "/images/feedback.png",
    line1: "Регистрация бизнеса",
    line2: "под ключ",
  },
];

const NAV = [
  { href: "#about", title: "О компании", sub: "Кто мы?" },
  { href: "#services", title: "Услуги", sub: "Что мы делаем?" },
  { href: "#reviews", title: "Отзывы", sub: "Клиенты о нас" },
  { href: "#catalog", title: "Прайс лист", sub: "Наши цены" },
  { href: "#contacts", title: "Контакты", sub: "Как нас найти?" },
];

const FOOTER_NAV = [
  { href: "#about", title: "О компании" },
  { href: "#services", title: "услуги" },
  { href: "#about", title: "команда" },
  { href: "#reviews", title: "отзывы" },
  { href: "#catalog", title: "прайс лист" },
  { href: "#contacts", title: "контакты" },
];

const SERVICES = [
  { href: "#catalog", icon: "/icons/folder.svg", iconW: 56, iconH: 41, label: "Готовые\nфирмы" },
  { href: "#contacts", icon: "/icons/stamp.svg", iconW: 46, iconH: 46, label: "Регистрация ООО\n«под ключ»" },
  { href: "#contacts", icon: "/icons/documents.svg", iconW: 61, iconH: 38, label: "Подготовка\nдокументов" },
  { href: "#contacts", icon: "/icons/correct.svg", iconW: 60, iconH: 38, label: "Внесение изменений\nв ЕГРЮЛ" },
  { href: "#services", icon: "/icons/usb.svg", iconW: 56, iconH: 40, label: "ЭЦП" },
];

const FIRMS = [
  { no: "006813", name: "Брэдберри", activity: "ИФНС: 7455, дата рег.: 1 квартал 2019, осн. ОКВЭД: 41.20", account: "без счета", price: "5 000" },
  { no: "006814", name: "Векторс групп", activity: "ИФНС: 7456, дата рег.: 2 квартал 2019, осн. ОКВЭД: 46.90", account: "счёт в ВТБ", price: "5 000" },
  { no: "006815", name: "Ремстройпро", activity: "ИФНС: 7457, дата рег.: 3 квартал 2019, осн. ОКВЭД: 43.30", account: "без счета", price: "5 000" },
  { no: "006816", name: "Агромаркет", activity: "ИФНС: 7458, дата рег.: 4 квартал 2019, осн. ОКВЭД: 01.11", account: "без счета", price: "5 000" },
];

const TESTIMONIALS = [
  {
    name: "Малышев Алексей",
    role: "Директор ОАО “Инфокар”",
    text: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
    image: "/images/client.png",
  },
  {
    name: "Иванова Мария",
    role: "Основатель ООО “ТехКорп”",
    text: "ПСБ Консалтинг оперативно помогли зарегистрировать компанию и открыть расчётный счёт. Документы подготовили без ошибок, сопровождение было на каждом этапе. Рекомендуем их корпоративные услуги тем, кто запускает бизнес в сжатые сроки.",
    image: "/images/client.png",
  },
  {
    name: "Сергеев Павел",
    role: "Директор ООО “Инсайт”",
    text: "Купили готовую фирму из каталога и в тот же день смогли участвовать в тендере. Юридическая проверка и передача документов прошли прозрачно, все печати и счета были в порядке.",
    image: "/images/client.png",
  },
];

const PARTNERS = [
  { src: "/images/partners/rossiya.png", alt: "Rossiya" },
  { src: "/images/partners/rostelecom.png", alt: "Ростелеком" },
  { src: "/images/partners/business-finance.png", alt: "Бизнес Финанс" },
  { src: "/images/partners/sberbank.png", alt: "Сбербанк" },
];

const ADVANTAGES = [
  "участия в тендерах,",
  "срочном заключении выгодного партнерства,",
  "срочной покупки оборудования или товаров,",
  "работы в уже сформированной фирме с оборудованием, штатом и действующими контрактами (при покупке готовой действующей компании с оборотами).",
];

function Logo({ className, ...props }) {
  return (
    <a href="#about" className={className} {...props}>
      <img src="/images/logo.png" alt="ПСБ Консалтинг" width={228} height={208} />
    </a>
  );
}

export default function Home() {
  const rootRef = useRef(null);
  const slidesRef = useRef([]);
  const titleRef = useRef(null);
  const reviewVisualRef = useRef(null);
  const reviewContentRef = useRef(null);
  const partnerCardsRef = useRef([]);
  const heroIndexRef = useRef(0);
  const slidingRef = useRef(false);
  const firstReviewRef = useRef(true);

  const [heroIndex, setHeroIndex] = useState(0);
  const [activeService, setActiveService] = useState(3);
  const [activeFirm, setActiveFirm] = useState(0);
  const [activeReview, setActiveReview] = useState(0);
  const [partnerOffset, setPartnerOffset] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", question: "" });
  const [agreed, setAgreed] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  usePageMotion(rootRef);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const changeHero = (direction) => {
    if (slidingRef.current) return;
    const from = heroIndexRef.current;
    const to = (from + direction + HERO_SLIDES.length) % HERO_SLIDES.length;
    slidingRef.current = true;
    heroIndexRef.current = to;
    setHeroIndex(to);
    const tl = animateHeroSlide(slidesRef.current, from, to, direction);
    animateHeroTitle(titleRef.current);
    if (tl) {
      tl.eventCallback("onComplete", () => {
        slidingRef.current = false;
      });
    } else {
      slidingRef.current = false;
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => changeHero(1), 6500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveReview((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, []);

  const changeReview = (index) => {
    if (index === activeReview) return;
    setActiveReview(index);
  };

  useEffect(() => {
    if (firstReviewRef.current) {
      firstReviewRef.current = false;
      return;
    }
    animateReviewSwap(reviewVisualRef.current, reviewContentRef.current);
  }, [activeReview]);

  const changePartners = (direction) => {
    setPartnerOffset((prev) => (prev + direction + PARTNERS.length) % PARTNERS.length);
    requestAnimationFrame(() => animatePartners(partnerCardsRef.current, direction));
  };

  const visiblePartners = [...PARTNERS.slice(partnerOffset), ...PARTNERS.slice(0, partnerOffset)];

  const closeMenu = () => setMenuOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !agreed) return;
    setSubmitted(true);
    setFormData({ name: "", phone: "", email: "", question: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const review = TESTIMONIALS[activeReview];
  const heroSlide = HERO_SLIDES[heroIndex];

  return (
    <main className={styles.main} ref={rootRef}>
      <section className={styles.hero} id="about">
        <div className={styles.heroSlides}>
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.src}
              className={`${styles.heroSlide} ${index === 0 ? styles.heroSlideActive : ""}`}
              data-hero-slide
              ref={(el) => {
                slidesRef.current[index] = el;
              }}
            >
              <Image src={slide.src} alt="" fill priority={index === 0} sizes="100vw" />
            </div>
          ))}
        </div>
        <div className={styles.heroShade} />

        <div className={styles.heroCanvas}>
          <div className={styles.heroGold} data-hero-gold />

          <Logo className={styles.logo} data-hero-logo />

          <div className={styles.heroContacts} data-hero-bar>
            <div className={styles.contactBlock}>
              <img src="/icons/pin.svg" alt="" width={14} height={19} className={styles.contactIcon} data-icon-hover />
              <div>
                <p className={styles.contactMain}>40 Baria Sreet 133/2, NewYork City, US</p>
                <a href="#contacts" className={styles.contactSub}>смотреть на карте</a>
              </div>
            </div>
            <div className={`${styles.contactBlock} ${styles.contactBlockRight}`}>
              <img src="/icons/phone.svg" alt="" width={17} height={19} className={styles.contactIcon} data-icon-hover />
              <div>
                <a href="tel:+7963048028" className={styles.phoneMain}>+7 963 04-80-28</a>
                <a href="#contacts" className={styles.contactSub}>заказать звонок</a>
              </div>
            </div>
          </div>

          <nav className={styles.nav} data-hero-nav>
            {NAV.map((item, index) => (
              <a key={item.href + item.title} href={item.href} className={`${styles.navItem} ${index === 0 ? styles.navItemActive : ""}`}>
                <span className={styles.navTitle}>{item.title}</span>
                <span className={styles.navSub}>{item.sub}</span>
              </a>
            ))}
          </nav>

          <h1 className={styles.heroTitle} data-hero-title ref={titleRef}>
            <span className={styles.heroTitleLine}>{heroSlide.line1}</span>
            {heroSlide.line2}
          </h1>
        </div>

        <button className={`${styles.sliderBtn} ${styles.sliderBtnLeft}`} aria-label="Предыдущий слайд" type="button" data-hero-arrow onClick={() => changeHero(-1)}>
          <span className={styles.sliderCircle} />
          <span className={styles.sliderArrow}>‹</span>
        </button>
        <button className={`${styles.sliderBtn} ${styles.sliderBtnRight}`} aria-label="Следующий слайд" type="button" data-hero-arrow onClick={() => changeHero(1)}>
          <span className={`${styles.sliderCircle} ${styles.sliderCircleOutline}`} />
          <span className={styles.sliderArrow}>›</span>
        </button>

        <button
          className={styles.burgerButton}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Открыть меню"
          aria-expanded={menuOpen}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </section>

      <div className={`${styles.mobileBackdrop} ${menuOpen ? styles.mobileBackdropOpen : ""}`} onClick={closeMenu} />
      <aside className={`${styles.mobileDrawer} ${menuOpen ? styles.mobileDrawerOpen : ""}`}>
        <div className={styles.mobileDrawerHeader}>
          <Logo className={styles.mobileLogo} />
          <button className={styles.mobileClose} onClick={closeMenu} aria-label="Закрыть меню" type="button">
            ×
          </button>
        </div>
        <nav className={styles.mobileNav}>
          {NAV.map((item) => (
            <a key={item.href + item.title} href={item.href} onClick={closeMenu}>
              <strong>{item.title}</strong>
              <span>{item.sub}</span>
            </a>
          ))}
        </nav>
        <div className={styles.mobileFooter}>
          <a href="tel:+7963048028">+7 963 04-80-28</a>
          <span>40 Baria Sreet 133/2, NewYork City, US</span>
        </div>
      </aside>

      <section className={styles.services} id="services">
        <div className="container">
          <div className={styles.serviceBar}>
            {SERVICES.map((service, index) => (
              <a
                key={service.label}
                href={service.href}
                className={`${styles.serviceCard} ${activeService === index ? styles.serviceCardActive : ""}`}
                data-service-card
                onMouseEnter={() => setActiveService(index)}
              >
                <span className={styles.serviceIcon} data-service-icon data-icon-hover>
                  <img src={service.icon} alt="" width={service.iconW} height={service.iconH} />
                </span>
                <span className={styles.serviceLabel}>
                  {service.label.split("\n").map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
                {activeService === index ? (
                  <span className={styles.servicePointer} aria-hidden>
                    ›
                  </span>
                ) : null}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.advantages} data-reveal>
        <div className="container">
          <div className={styles.sectionHeading}>
            <span className={styles.sectionMark} aria-hidden data-reveal-mark />
            <h2 className={styles.sectionTitle} data-reveal-title>
              Преимущество покупки
              <br />
              готовых фирм
            </h2>
          </div>

          <div className={styles.advantagesGrid}>
            <div className={styles.advantagesPhoto} data-reveal-item>
              <Image src="/images/advantages.png" alt="Рабочий стол" width={370} height={270} />
            </div>
            <div className={styles.advantagesText} data-reveal-item>
              <p>
                Готовые юридические фирмы в регионе Москва – это масса возможностей для быстрого и успешного развития бизнеса в столице. Ведь приобретая полностью сформированный и уже прошедший регистрацию пакет документов, вы получаете Общество, работа которого может быть начата незамедлительно, что крайне важно для:
              </p>
              <ul className={styles.checklist}>
                {ADVANTAGES.map((item) => (
                  <li key={item} data-reveal-item>
                    <img src="/icons/shield.svg" alt="" width={17} height={21} data-icon-hover />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className={styles.advantagesNote} data-reveal-item>
            «Центр поддержки бизнеса» осуществляет продажу готовых фирм в Москве на максимально выгодных для вас условиях. В нашем каталоге вы найдете юридически проверенные компании с наличием банковских счетов, печатей и даже юридический адресов при необходимости.
          </p>
        </div>
      </section>

      <section className={styles.catalog} id="catalog" data-reveal>
        <div className="container">
          <div className={styles.catalogHead}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionMark} aria-hidden data-reveal-mark />
              <h2 className={styles.sectionTitle} data-reveal-title>
                каталог готовых
                <br />
                фирм
              </h2>
            </div>
            <button
              className={styles.downloadBox}
              type="button"
              data-reveal-item
              onClick={() => alert("Скачивание каталога (демо).")}
            >
              <img src="/icons/cloud.svg" alt="" width={58} height={43} data-float-icon data-icon-hover />
              <span>скачать каталог</span>
            </button>
          </div>

          <div className={styles.tableHint}>← Прокрутите таблицу горизонтально →</div>
          <div className={styles.tableWrap} data-reveal-item>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>№</th>
                  <th>название</th>
                  <th>Налоговая, основной ОКВЭД</th>
                  <th>Наличие счета</th>
                  <th>Цена</th>
                </tr>
              </thead>
              <tbody>
                {FIRMS.map((firm, index) => (
                  <Fragment key={firm.no}>
                    <tr
                      className={activeFirm === index ? styles.rowOpen : undefined}
                      onClick={() => setActiveFirm(index)}
                    >
                      <td>{firm.no}</td>
                      <td>{firm.name}</td>
                      <td>{firm.activity}</td>
                      <td>{firm.account}</td>
                      <td>
                        <span className={styles.price}>
                          {firm.price} <span className={styles.ruble}>₽</span>
                        </span>
                      </td>
                    </tr>
                    {activeFirm === index ? (
                      <tr className={styles.buyRow}>
                        <td colSpan={5}>
                          <button
                            className={styles.buyBar}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Покупка ${firm.name}`);
                            }}
                          >
                            купить
                          </button>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.catalogCta} data-reveal-item>
            <a href="#catalog" className={styles.outlineBtn}>перейти в каталог</a>
          </div>
        </div>
      </section>

      <section className={styles.reviews} id="reviews" data-reveal>
        <div className="container">
          <div className={styles.sectionHeading}>
            <span className={styles.sectionMark} aria-hidden data-reveal-mark />
            <h2 className={styles.sectionTitle} data-reveal-title>
              отзывы наших
              <br />
              клиентов
            </h2>
          </div>

          <div className={styles.reviewGrid}>
            <div className={styles.reviewVisual} ref={reviewVisualRef} data-reveal-item>
              <span className={styles.reviewWatermark}>Клиенты</span>
              <div className={styles.reviewFrame}>
                <img src="/icons/dots-1.svg" alt="" className={`${styles.dots} ${styles.dots1}`} />
                <img src="/icons/dots-2.svg" alt="" className={`${styles.dots} ${styles.dots2}`} />
                <img src="/icons/dots-3.svg" alt="" className={`${styles.dots} ${styles.dots3}`} />
                <img src="/icons/dots-4.svg" alt="" className={`${styles.dots} ${styles.dots4}`} />
                <div className={styles.reviewPhoto}>
                  <Image src={review.image} alt={review.name} width={336} height={339} />
                  <span className={styles.reviewPhotoFade} />
                </div>
              </div>
              <div className={styles.reviewPerson}>
                <span className={styles.reviewRole}>{review.role}</span>
                <span className={styles.reviewName}>{review.name}</span>
              </div>
            </div>

            <div className={styles.reviewContent} ref={reviewContentRef} data-reveal-item>
              <img src="/icons/quotes.svg" alt="" width={57} height={38} className={styles.quoteOpen} data-quote-icon />
              <p>{review.text}</p>
              <img src="/icons/quotes-close.svg" alt="" width={57} height={38} className={styles.quoteClose} data-quote-icon />
            </div>
          </div>

          <div className={styles.dotsNav} data-reveal-item>
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`${styles.dot} ${activeReview === index ? styles.dotActive : ""}`}
                onClick={() => changeReview(index)}
                aria-label={`Отзыв ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.partners} data-reveal>
        <div className="container">
          <div className={styles.sectionHeading}>
            <span className={styles.sectionMark} aria-hidden data-reveal-mark />
            <h2 className={styles.sectionTitle} data-reveal-title>
              наши
              <br />
              партнеры
            </h2>
          </div>
        </div>

        <div className={styles.partnersRow}>
          <button className={`${styles.sliderBtn} ${styles.partnerBtnLeft}`} type="button" aria-label="Предыдущие партнёры" onClick={() => changePartners(-1)}>
            <span className={styles.sliderCircle} />
            <span className={`${styles.sliderArrow} ${styles.sliderArrowDark}`}>‹</span>
          </button>
          <div className="container">
            <div className={styles.partnersGrid}>
              {visiblePartners.map((partner, index) => (
                <div
                  key={partner.alt}
                  className={styles.partnerCard}
                  data-reveal-item
                  ref={(el) => {
                    partnerCardsRef.current[index] = el;
                  }}
                >
                  <Image src={partner.src} alt={partner.alt} width={270} height={170} />
                </div>
              ))}
            </div>
          </div>
          <button className={`${styles.sliderBtn} ${styles.partnerBtnRight}`} type="button" aria-label="Следующие партнёры" onClick={() => changePartners(1)}>
            <span className={`${styles.sliderCircle} ${styles.sliderCircleOutlineDark}`} />
            <span className={`${styles.sliderArrow} ${styles.sliderArrowDark}`}>›</span>
          </button>
        </div>
      </section>

      <section className={styles.feedback} id="contacts" data-reveal>
        <div className={styles.feedbackPhoto} style={{ position: "absolute" }} data-reveal-item>
          <Image src="/images/feedback.png" alt="" fill sizes="(max-width: 768px) 100vw, 60vw" />
        </div>
        <div className={styles.feedbackFade} />

        <div className={`container ${styles.feedbackInner}`}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionMark} aria-hidden data-reveal-mark />
            <h2 className={styles.sectionTitle} data-reveal-title>
              остались вопросы?
              <br />
              напишите нам
            </h2>
          </div>

          {submitted ? (
            <p className={styles.formSuccess}>Спасибо! Мы свяжемся с вами в ближайшее время.</p>
          ) : null}

          <form className={styles.form} onSubmit={handleSubmit} data-reveal-item>
            <div className={styles.formLeft}>
              <input
                className={styles.input}
                name="name"
                placeholder="Ваше имя"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <input
                className={styles.input}
                type="tel"
                name="phone"
                placeholder="Ваш телефон"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />
              <input
                className={styles.input}
                type="email"
                name="email"
                placeholder="Ваш e-mail"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <textarea
              className={styles.textarea}
              name="question"
              placeholder="Вопрос"
              value={formData.question}
              onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
            />

            <label className={styles.agree}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
              <span className={styles.checkbox} aria-hidden />
              <span>Я согласен с Политикой конфиденциальности</span>
            </label>

            <button type="submit" className={styles.outlineBtn}>отправить вопрос</button>
          </form>

          <footer className={styles.footer}>
            <nav className={styles.footerNav}>
              {FOOTER_NAV.map((item) => (
                <a key={item.title} href={item.href}>{item.title}</a>
              ))}
            </nav>
            <p className={styles.copyright}>© Copyright 2019 ПСБ Консалтинг</p>
          </footer>
        </div>
      </section>
    </main>
  );
}
