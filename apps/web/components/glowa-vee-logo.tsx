import Image from 'next/image';

const taglineCharacters = 'Skin Repair Products'.split('');

export function GlowaVeeLogo({
    className = '',
}: {
    className?: string;
}) {
    return (
        <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
            <span className="relative flex h-13 w-13 shrink-0 items-center justify-center sm:h-17 sm:w-18">
                <Image
                    src="/logo.png"
                    alt=""
                    width={50}
                    height={50}
                    priority
                    className="h-full w-full object-contain drop-shadow-[0_0_12px_rgba(216,181,109,0.12)]"
                />
            </span>

            <span className="flex min-w-0 flex-col items-stretch justify-center leading-none">

                {/* Brand name */}
                <span className="gold-foil-text block uppercase whitespace-nowrap font-display text-[1.2rem] font-semibold tracking-widest sm:text-[1.8rem]">
                    Collagen
                </span>

                {/* Descriptor — exact same width as the brand name */}
                <span
                    aria-label="Skin Repair Products"
                    className="mt-1.5 flex w-full uppercase items-center justify-between whitespace-nowrap font-body text-[7px] font-semibold leading-none text-(--color-text-muted) sm:text-[10px]"
                >
                    {taglineCharacters.map((character, index) => (
                        <span
                            key={`${character}-${index}`}
                            aria-hidden="true"
                            className={character === '&' ? 'mx-1' : undefined}
                        >
                            {character}
                        </span>
                    ))}
                </span>
            </span>
        </span>
    );
}