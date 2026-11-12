import { PolicyPage } from '@/components/policy-page';

export const metadata = {
    title: 'Privacy Policy | Glowa Vee',
    description: 'Privacy and POPIA Policy for Glowa Vee.',
};

export default function PrivacyPolicyPage() {
    return (
        <PolicyPage
            eyebrow="Your Privacy"
            title="Privacy Policy"
            icon="privacy"
            description="How Glowa Vee collects, uses and protects your personal information."
            sections={[
                {
                    title: 'Introduction',
                    content: [
                        'Glowa Vee respects your privacy and is committed to protecting your personal information.',
                        'This Privacy Policy explains how we collect, use, store and protect personal information when you use our website, place an order or communicate with us.',
                        'We process personal information in accordance with applicable South African privacy laws, including the Protection of Personal Information Act 4 of 2013 (POPIA), where applicable.',
                    ],
                },
                {
                    title: 'Information We Collect',
                    content: [
                        'Depending on how you interact with our website, we may collect information necessary to process and fulfil your order or respond to your enquiries.',
                    ],
                    bullets: [
                        'Name and surname.',
                        'Email address.',
                        'Telephone or WhatsApp number.',
                        'Delivery and billing address.',
                        'Order and transaction information.',
                        'Information provided when contacting customer support.',
                        'Technical information relating to your use of the website, where collected through cookies or similar technologies.',
                    ],
                },
                {
                    title: 'How We Use Your Information',
                    content: [
                        'We use personal information only for legitimate business purposes connected with providing our products and services.',
                    ],
                    bullets: [
                        'Processing and fulfilling orders.',
                        'Processing payments through our payment service providers.',
                        'Arranging delivery of purchased products.',
                        'Communicating with customers about orders and enquiries.',
                        'Providing customer support.',
                        'Maintaining and improving our website and services.',
                        'Preventing fraud, abuse and unauthorised transactions.',
                        'Complying with applicable legal and regulatory obligations.',
                    ],
                },
                {
                    title: 'Payment Information',
                    content: [
                        'Payments may be processed through third-party payment service providers. We do not intentionally store complete card details on our own systems where payment processing is handled by an external payment provider.',
                        'Payment providers may process information in accordance with their own privacy policies and terms.',
                    ],
                },
                {
                    title: 'Sharing Personal Information',
                    content: [
                        'We do not sell your personal information.',
                        'We may share information with trusted third parties where reasonably necessary to operate our business and fulfil your order.',
                    ],
                    bullets: [
                        'Payment service providers.',
                        'Courier and delivery providers.',
                        'Website, hosting and technology service providers.',
                        'Professional advisers where reasonably necessary.',
                        'Law enforcement, regulators or other authorities where required by law.',
                    ],
                },
                {
                    title: 'Cookies and Website Technologies',
                    content: [
                        'Our website may use cookies or similar technologies to provide essential functionality, remember preferences, maintain shopping cart functionality and understand how visitors use the website.',
                        'You may be able to control cookies through your browser settings. Disabling certain cookies may affect some website functionality.',
                    ],
                },
                {
                    title: 'Data Security',
                    content: [
                        'We take reasonable technical and organisational measures to protect personal information against unauthorised access, loss, misuse, alteration or disclosure.',
                        'However, no internet transmission or electronic storage system can be guaranteed to be completely secure.',
                    ],
                },
                {
                    title: 'Data Retention',
                    content: [
                        'We retain personal information only for as long as reasonably necessary for the purposes for which it was collected, to provide our services, resolve disputes, maintain business records and comply with applicable legal obligations.',
                    ],
                },
                {
                    title: 'Your Rights',
                    content: [
                        'Subject to applicable law, you may have rights relating to your personal information, including requesting access to personal information we hold about you and requesting correction of inaccurate information.',
                        'You may contact us if you have a question or concern about how your personal information is handled.',
                    ],
                },
                {
                    title: 'Children’s Information',
                    content: [
                        'Our website and services are intended for general consumers and are not specifically directed at children. We do not knowingly collect personal information from children for purposes unrelated to providing our services.',
                    ],
                },
                {
                    title: 'Changes to This Policy',
                    content: [
                        'We may update this Privacy Policy from time to time to reflect changes to our business, website, services or applicable legal requirements. The latest version published on this website will apply from the date it is published.',
                    ],
                },
                {
                    title: 'Contact Us',
                    content: [
                        'If you have questions about this Privacy Policy or wish to raise a privacy-related concern, please contact Glowa Vee using the contact details provided on this website.',
                    ],
                },
            ]}
        />
    );
}
