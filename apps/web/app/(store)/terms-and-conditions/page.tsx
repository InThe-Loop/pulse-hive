import { PolicyPage } from '@/components/policy-page';

export const metadata = {
    title: 'Terms & Conditions | Glowa Vee',
    description: 'Terms and Conditions for Glowa Vee.',
};

export default function TermsAndConditionsPage() {
    return (
        <PolicyPage
            eyebrow="Legal Information"
            title="Terms & Conditions"
            icon="terms"
            description="Please read these terms before using our website or placing an order."
            sections={[
                {
                    title: 'Introduction',
                    content: [
                        'These Terms and Conditions govern the use of the Glowa Vee website and the purchase of products through our online store.',
                        'Glowa Vee is the trading name of MISSVEE TMI GROUP (PTY) LTD. By using this website or placing an order, you acknowledge that you have read and agreed to these Terms and Conditions.',
                    ],
                },
                {
                    title: 'Our Products',
                    content: [
                        'Glowa Vee sells and distributes skincare and beauty products.',
                        'Product descriptions, images, sizes, colours, packaging and availability are provided as accurately as reasonably possible. Minor variations in packaging or product appearance may occur.',
                        'Customers are responsible for reading product descriptions and available usage instructions before purchasing.',
                    ],
                },
                {
                    title: 'Orders',
                    content: [
                        'An order placed through the website constitutes a request to purchase the selected products.',
                        'Orders are subject to product availability and successful payment.',
                        'We reserve the right to contact a customer if there is an issue with an order, payment, stock availability or delivery information.',
                    ],
                },
                {
                    title: 'Prices and Payment',
                    content: [
                        'All prices displayed on the website are in South African Rand (ZAR), unless otherwise stated.',
                        'Payment must be completed using the payment methods made available during checkout.',
                        'An order will only be processed once payment has been successfully received and verified.',
                    ],
                },
                {
                    title: 'Delivery',
                    content: [
                        'Orders will be delivered to the delivery address supplied by the customer during checkout.',
                        'Customers are responsible for ensuring that their delivery information is accurate and complete.',
                        'Delivery times may vary depending on the destination, courier availability and circumstances outside our reasonable control.',
                    ],
                },
                {
                    title: 'Customer Responsibility',
                    content: [
                        'Customers are responsible for providing accurate information during checkout and for following the product instructions supplied with their purchase.',
                        'Customers should discontinue use of a product if they experience an adverse reaction and seek appropriate professional advice where necessary.',
                    ],
                },
                {
                    title: 'Website Use',
                    content: [
                        'You agree not to misuse, interfere with or attempt to gain unauthorised access to the website or its systems.',
                        'We reserve the right to restrict or terminate access where the website is being used unlawfully, fraudulently or in a manner that may harm the business or other users.',
                    ],
                },
                {
                    title: 'Intellectual Property',
                    content: [
                        'The Glowa Vee name, branding, logos, images, text and other website content belong to or are used by Glowa Vee with appropriate rights.',
                        'Website content may not be copied, reproduced, distributed or commercially used without prior written permission.',
                    ],
                },
                {
                    title: 'Limitation of Liability',
                    content: [
                        'We take reasonable steps to ensure that information provided on the website is accurate. However, we do not guarantee that the website will always be available, uninterrupted or completely error-free.',
                        'Nothing in these Terms and Conditions is intended to exclude or limit any right or remedy that cannot lawfully be excluded or limited under applicable South African law.',
                    ],
                },
                {
                    title: 'Changes to These Terms',
                    content: [
                        'We may update these Terms and Conditions from time to time. The latest version published on this website will apply to future use of the website and future orders.',
                    ],
                },
                {
                    title: 'Contact',
                    content: [
                        'If you have questions regarding these Terms and Conditions, please contact Glowa Vee using the contact details provided on this website.',
                    ],
                },
            ]}
        />
    );
}
