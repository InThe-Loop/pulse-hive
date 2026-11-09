import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TENANT_CODE = 'GLV-000001';

const products = 
[
    {
        image: '/products/nightcream.png',
        name: 'Insumpa/Skin Tags Collagen Cream',
        price: 150,
        size: '50g',
        description:
        'Targeted collagen cream formulated for smooth, clear skin and skin tag care.',
    },
    {
        image: '/products/capsules.png',
        name: 'Insumpa/Skin Tags Collagen Capsules',
        price: 300,
        size: '30 caps.',
        description:
        'Advanced internal collagen capsules to support overall skin clarity from within.',
    },
    {
        image: '/products/serum.png',
        name: 'Collagen Serum',
        price: 60,
        size: '30ml',
        description:
        'Concentrated collagen serum for deep hydration and a youthful glow.',
    },
    {
        image: '/products/daycream.png',
        name: 'Collagen Day Cream',
        price: 150,
        size: '50g',
        description:
        'Daily protective collagen moisturizer for sustained radiance and softness.',
    },
    {
        image: '/products/malesma.png',
        name: 'Melasma Oil',
        price: 180,
        size: '50ml',
        description:
        'Specialized treatment oil designed to visibly address melasma and uneven tone.',
    },
    {
        image: '/products/soap.png',
        name: 'Collagen Bar Soap',
        price: 60,
        size: '100g',
        description:
        'Nourishing cleansing bar infused with collagen for daily freshness.',
    },
    {
        image: '/products/bodyglowgel.png',
        name: 'Collagen Skin Brightening Glow Body Gel',
        price: 220,
        size: '100ml',
        description:
        'Luxurious body oil formulated to brighten, firm, and enrich skin tone.',
    },
    {
        image: '/products/bodylotion.png',
        name: 'Collagen Hydrating Body Lotion',
        price: 180,
        size: '100ml',
        description:
        'Deeply moisturizing body lotion that locks in hydration for silky-smooth skin.',
    },
    {
        image: '/products/slimmingtea.png',
        name: 'Slimming Tea',
        price: 450,
        size: '1 pack',
        description:
        'Refreshing herbal tea blend designed to support a healthy lifestyle and wellness goals.',
    },
    {
        image: '/products/bodygain.png',
        name: 'Body Gain Tablets',
        price: 250,
        size: '20 tablets',
        description:
        'Formulated tablets to help support healthy body mass and physical development.',
    },
    {
        image: '/products/bodypowder.png',
        name: 'Body Gain Powder',
        price: 120,
        size: '100g',
        description:
        'Nutritious powder supplement created to support healthy weight gain and body goals.',
    },
    {
        image: '/products/hipsbumgain.png',
        name: 'Hips and Bum Gain Tablets',
        price: 400,
        size: '20 tablets',
        description:
        'Targeted supplement designed to help tone, enhance, and support curves.',
    },
    {
        image: '/products/innerthighs.png',
        name: 'Inner Dark Thighs Gel',
        price: 150,
        size: '100ml',
        description:
        'Specialized soothing gel formulated to help even out skin tone in sensitive areas.',
    },
    {
        image: '/products/allglam.jpg',
        name: 'All Glam',
        price: 700,
        size: '5-Piece Collection',
        description:
        'A complete Glowa Vee skincare collection featuring Collagen Night Cream, Collagen Glowing Serum, Collagen Capsules, Collagen Day Cream Brightening, and Collagen Bar Soap.',
    },
    {
        image: '/products/bodyhealth.jpg',
        name: 'Body Health',
        price: 700,
        size: '3-Piece Collection',
        description:
        'A complete body wellness collection featuring Hips & Bum Gain Tablets, Body Gain Tablets, and Body Gain Powder.',
    },
    {
        image: '/products/combo.jpg',
        name: 'Skin Tag Removal Combo',
        price: 420,
        size: '50g night cream plus 30 Caps',
        description:
        'A specially selected combination of Glowa Vee products for your beauty and wellness routine featuring the Collagen Night Cream and Collagen Capsules.',
    },
    {
        image: '/products/creamsserum.jpg',
        name: 'Collagen Creams & Serum',
        price: 330,
        size: '3-Piece Collection',
        description:
        'A skincare combination designed to complement your daily beauty routine. Inside the box: 1x 50g Night Cream, 1x 50g Day Cream plus 30ml Serum',
    },
    {
        image: '/products/famous.jpg',
        name: 'Famous Box',
        price: 1000,
        size: '7-Piece Collection',
        description:
        'A premium Glowa Vee beauty and wellness product created to support your self-care routine. Inside the box: 1x 50g Night Cream, 1x 50g Day Cream, 1x 30ml Serum, 1x 100g Soap Bar, 1x 30 Capsules, 1x 100ml Hydrating Body Lotion and 1x 100ml Body Hydrating Gel',
    },
    {
        image: '/products/hormone.jpg',
        name: 'Hormone Balance Tablets',
        price: 170,
        size: '30 Tablets',
        description:
        'A wellness product formulated to complement your personal health. Support hormone health and overall well-being.',
    },
    {
        image: '/products/prebiotic.jpg',
        name: 'Prebiotic Tablets',
        price: 120,
        size: '20 tablets',
        description:
        'A prebiotic supplement designed to support digestive wellness. Supports digestion and gut health.',
    },
];

async function main() {
    console.log(`Looking up tenant ${TENANT_CODE}...`);

    const tenant = await prisma.tenant.findUnique({
        where: {
            tenantCode: TENANT_CODE,
        },
    });

    if (!tenant) {
        throw new Error(`Tenant ${TENANT_CODE} was not found.`);
    }

    console.log(`Found tenant: ${tenant.name} (${tenant.id})`);
    console.log(`Preparing ${products.length} products...`);

    const existingProducts = await prisma.product.findMany({
        where: {
            tenantId: tenant.id,
        },
        select: {
            id: true,
            name: true,
            image: true,
        },
    });

    if (existingProducts.length > 0) {
        throw new Error(
            `Tenant ${TENANT_CODE} already has ${existingProducts.length} product(s). Import aborted to prevent duplicates.`,
        );
    }

    const createdProducts = await prisma.$transaction(
        products.map((product) =>
        prisma.product.create({
            data: {
                tenantId: tenant.id,
                name: product.name,
                description: product.description,
                sku: null,
                image: product.image,
                size: product.size,
                price: product.price,
                catalogueType: [
                    'All Glam',
                    'Body Health',
                    'Skin Tag Removal Combo',
                    'Collagen Creams & Serum',
                    'Famous Box',
                ].includes(product.name)
                    ? 'COMBO'
                    : 'PRODUCT',
                status: 'ACTIVE',
            },
        }),
        ),
    );

    console.log(`Successfully imported ${createdProducts.length} products.`);

    for (const product of createdProducts) {
        console.log(
            `${product.id} | ${product.name} | R${product.price.toString()} | ${product.size} | ${product.image}`,
        );
    }
}

main()
    .catch((error) => {
        console.error('Product import failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
});
