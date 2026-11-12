'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { bannerSlides } from './constants';

export function HomeHero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(
                (previous) => (previous + 1) % bannerSlides.length,
            );
        }, 4500);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="px-5 pt-1 sm:px-6">
            <div className="relative mx-auto flex aspect-5/3.5 w-full max-w-full items-end overflow-hidden border border-(--color-border-strong) bg-black shadow-[0_16px_45px_rgba(0,0,0,0.35)]">
                {bannerSlides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                            currentSlide === index
                                ? 'z-10 scale-100 opacity-100'
                                : 'pointer-events-none z-0 scale-105 opacity-0'
                        }`}
                    >
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                            loading={index === 0 ? 'eager' : 'lazy'}
                        />

                        <div className="absolute inset-0 z-10 bg-linear-to-t from-black via-black/55 to-black/10" />

                        <div className="absolute inset-0 z-10 bg-linear-to-tr from-(--color-gold-dark)/25 via-transparent to-transparent" />
                    </div>
                ))}

                <div className="relative z-20 flex w-full flex-col items-center justify-end p-6 text-center sm:p-7">
                    <div className="mb-3 inline-flex w-max items-center gap-1.5 rounded-full border border-(--color-gold)/40 bg-black/50 px-3 py-1 text-xs font-semibold tracking-wide text-(--color-gold-light) backdrop-blur-md">
                        {bannerSlides[currentSlide].tag}
                    </div>

                    <h2 className="mb-1 font-serif text-xl tracking-tight text-white drop-shadow-lg sm:text-2xl">
                        {bannerSlides[currentSlide].title}
                    </h2>

                    <p className="max-w-xl font-sans text-xs text-white/85 drop-shadow-md sm:text-sm">
                        {bannerSlides[currentSlide].subtitle}
                    </p>
                </div>

                <div className="pointer-events-auto absolute bottom-5 right-6 z-50 flex items-center gap-2">
                    {bannerSlides.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
                                currentSlide === index
                                    ? 'w-7 bg-(--color-gold-light)'
                                    : 'w-2 bg-white/70 hover:bg-white'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
