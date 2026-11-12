import { PolicyPage } from '@/components/policy-page';

export const metadata = {
    title: 'Refund & Returns | Glowa Vee',
    description: 'Refund, cancellation and returns policy for Glowa Vee.',
};

export default function RefundCancellationReturnsPage() {
    return (
        <PolicyPage
            eyebrow="Orders & Returns"
            title="Refund & Returns"
            icon="refund"
            description="Please review our cancellation, refund and returns policy before placing an order."
            sections={[
                {
                    title: 'Our General Refund Policy',
                    content: [
                        'Glowa Vee generally does not offer refunds for change-of-mind purchases, incorrect product selection or products that the customer simply no longer wants.',
                        'This policy is made available to customers before purchase so that customers can review our terms before completing an order.',
                        'Nothing in this policy is intended to remove or limit any consumer right or remedy that cannot lawfully be excluded under applicable South African law.',
                    ],
                },
                {
                    title: 'Before You Place an Order',
                    content: [
                        'Customers are encouraged to carefully review product descriptions, product sizes, quantities, prices and delivery information before completing payment.',
                        'If you are unsure about a product, please contact us before placing your order and we will assist where possible.',
                    ],
                },
                {
                    title: 'Order Cancellation',
                    content: [
                        'Cancellation requests should be submitted as soon as possible after placing an order.',
                        'An order that has already been processed, packed or dispatched may not be cancellable.',
                        'Where an order is successfully cancelled before processing, any applicable refund will be handled in accordance with the circumstances of the cancellation and applicable law.',
                    ],
                },
                {
                    title: 'Incorrect or Damaged Products',
                    content: [
                        'If you receive an incorrect product or a product that appears to have been damaged before or during delivery, please contact us as soon as reasonably possible after receiving the order.',
                        'Please provide your order details and clear photographs showing the product, packaging and the issue so that we can investigate the matter.',
                        'Where the issue is verified and a remedy is required under applicable law, we will provide the appropriate remedy.',
                    ],
                },
                {
                    title: 'Products That Have Been Opened or Used',
                    content: [
                        'For hygiene and product safety reasons, we may not accept the return of skincare or beauty products that have been opened, used, altered or tampered with, except where applicable law requires otherwise.',
                        'Customers should inspect products promptly after delivery and contact us if there is an issue.',
                    ],
                },
                {
                    title: 'Change of Mind',
                    content: [
                        'We do not generally accept returns or provide refunds simply because a customer has changed their mind, selected the wrong product, selected the wrong size or quantity, or no longer wants the product.',
                        'Customers should ensure that they are satisfied with their selection before completing payment.',
                    ],
                },
                {
                    title: 'Allergic or Skin Reactions',
                    content: [
                        'Customers should review product ingredients and usage information before using a product and should discontinue use if irritation or an adverse reaction occurs.',
                        'A product reaction does not automatically constitute a basis for a refund. Customers should contact us with details of the situation so that it can be considered appropriately.',
                        'Where a remedy is required by applicable law, the applicable legal rights will apply.',
                    ],
                },
                {
                    title: 'Refund Processing',
                    content: [
                        'Where a refund is approved, refunds will generally be processed using the original payment method where reasonably possible.',
                        'The time taken for funds to reflect may depend on the relevant payment provider or financial institution.',
                    ],
                },
                {
                    title: 'How to Request Assistance',
                    content: [
                        'To report an incorrect, damaged or defective product or to raise a concern regarding an order, contact us using the WhatsApp number provided on this website.',
                        'Please include your order number, contact details, a description of the issue and supporting photographs where applicable.',
                    ],
                },
                {
                    title: 'Legal Rights',
                    content: [
                        'This policy is intended to operate alongside applicable South African consumer protection laws. Where the law provides a consumer with a right or remedy that cannot be excluded by agreement, that right or remedy will continue to apply.',
                    ],
                },
            ]}
        />
    );
}
