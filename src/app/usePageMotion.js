"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function usePageMotion(rootRef) {
  useGSAP(
    () => {
      const q = gsap.utils.selector(rootRef);

      gsap.fromTo(
        q("[data-hero-gold]"),
        { scaleY: 0, transformOrigin: "top" },
        { scaleY: 1, duration: 0.8, ease: "power3.out" },
      );
      gsap.fromTo(
        q("[data-hero-logo]"),
        { autoAlpha: 0, y: -24 },
        { autoAlpha: 1, y: 0, duration: 0.55, delay: 0.35, ease: "power3.out" },
      );
      gsap.fromTo(
        q("[data-hero-bar] > *"),
        { autoAlpha: 0, y: -12 },
        { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.45, delay: 0.4, ease: "power3.out" },
      );
      gsap.fromTo(
        q("[data-hero-nav] > *"),
        { autoAlpha: 0, y: -10 },
        { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.4, delay: 0.5, ease: "power3.out" },
      );
      gsap.fromTo(
        q("[data-hero-title]"),
        { autoAlpha: 0, x: -48 },
        { autoAlpha: 1, x: 0, duration: 0.7, delay: 0.55, ease: "power3.out" },
      );
      gsap.fromTo(
        q("[data-hero-arrow]"),
        { autoAlpha: 0, scale: 0.6 },
        { autoAlpha: 1, scale: 1, stagger: 0.1, duration: 0.4, delay: 0.7, ease: "back.out(1.6)" },
      );

      gsap.fromTo(
        q("[data-service-card]"),
        { y: 48, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.55, delay: 0.45, ease: "power3.out" },
      );
      gsap.fromTo(
        q("[data-service-icon]"),
        { scale: 0, rotate: -20 },
        { scale: 1, rotate: 0, stagger: 0.1, duration: 0.55, delay: 0.6, ease: "back.out(1.7)" },
      );

      const firstSlideImg = q("[data-hero-slide]")[0]?.querySelector("img");
      if (firstSlideImg) {
        gsap.fromTo(firstSlideImg, { scale: 1.08 }, { scale: 1, duration: 6, ease: "none" });
      }

      q("[data-reveal]").forEach((section) => {
        const mark = section.querySelector("[data-reveal-mark]");
        const title = section.querySelector("[data-reveal-title]");
        const items = section.querySelectorAll("[data-reveal-item]");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });

        if (mark) {
          tl.fromTo(mark, { scaleY: 0, transformOrigin: "top" }, { scaleY: 1, duration: 0.5, ease: "power2.out" });
        }
        if (title) {
          tl.fromTo(title, { x: -36, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out" }, "-=0.25");
        }
        if (items.length) {
          tl.fromTo(items, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.5, ease: "power3.out" }, "-=0.2");
        }
      });

      gsap.to(q("[data-float-icon]"), {
        y: -8,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      q("[data-icon-hover]").forEach((el) => {
        const onEnter = () => {
          gsap.to(el, { scale: 1.14, rotate: -8, duration: 0.28, ease: "back.out(2)", overwrite: "auto" });
        };
        const onLeave = () => {
          gsap.to(el, { scale: 1, rotate: 0, duration: 0.28, ease: "power2.out", overwrite: "auto" });
        };
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    },
    { scope: rootRef },
  );
}

export function animateHeroSlide(slides, fromIndex, toIndex, direction) {
  const from = slides[fromIndex];
  const to = slides[toIndex];
  if (!from || !to) return null;

  gsap.killTweensOf([from, to]);
  gsap.set(to, { autoAlpha: 1, xPercent: direction * 20, zIndex: 2 });
  gsap.set(from, { zIndex: 1 });

  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
  tl.to(from, { autoAlpha: 0, xPercent: direction * -14, duration: 0.75 }, 0)
    .to(to, { xPercent: 0, duration: 0.75 }, 0);

  const img = to.querySelector("img");
  if (img) {
    tl.fromTo(img, { scale: 1.1 }, { scale: 1, duration: 5.5, ease: "none" }, 0);
  }
  return tl;
}

export function animateHeroTitle(titleEl) {
  if (!titleEl) return;
  gsap.fromTo(
    titleEl,
    { autoAlpha: 0, x: -28 },
    { autoAlpha: 1, x: 0, duration: 0.55, ease: "power3.out" },
  );
}

export function animateReviewSwap(visualEl, contentEl) {
  const targets = [visualEl, contentEl].filter(Boolean);
  if (!targets.length) return;
  gsap.fromTo(
    targets,
    { autoAlpha: 0, y: 22 },
    { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" },
  );
  const quotes = contentEl?.querySelectorAll("[data-quote-icon]");
  if (quotes?.length) {
    gsap.fromTo(
      quotes,
      { scale: 0.6, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.45, stagger: 0.08, ease: "back.out(1.6)" },
    );
  }
}

export function animatePartners(cards, direction) {
  if (!cards?.length) return;
  gsap.fromTo(
    cards,
    { x: direction * 56, autoAlpha: 0 },
    { x: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: "power3.out" },
  );
}
