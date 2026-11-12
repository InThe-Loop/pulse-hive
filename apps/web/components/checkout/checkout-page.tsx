'use client';

import {
    CheckoutEmptyState,
    CheckoutError,
    CheckoutHeader,
    CheckoutSuccessState,
    CustomerDetails,
    DeliveryDetails,
    OrderSummary,
} from './checkout-sections';

import { useCheckout } from './use-checkout';

export default function CheckoutPage() {
    const checkout = useCheckout();

    const {
        cartData,
        shippingOption,
        subtotal,
        shippingFee,
        totalToPay,
        customerName,
        setCustomerName,
        phoneNumber,
        setPhoneNumber,
        lockerName,
        setLockerName,
        street,
        setStreet,
        suburb,
        setSuburb,
        city,
        setCity,
        postalCode,
        setPostalCode,
        isLocker,
        completed,
        loading,
        errorMessage,
        profileLoaded,
        customerAuthenticated,
        handleSubmit,
    } = checkout;

    return (
        <div className="min-h-screen w-full bg-(--color-background) pb-12">
            <main className="mx-auto w-full max-w-[1440px] px-5 pt-6 sm:px-6 sm:pt-8">
                <CheckoutError message={errorMessage} />

                {cartData.length === 0 && !completed ? (
                    <>
                        <CheckoutHeader />
                        <CheckoutEmptyState />
                    </>
                ) : completed && !loading ? (
                    <>
                        <CheckoutHeader />
                        <CheckoutSuccessState
                            shippingOption={shippingOption}
                        />
                    </>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.85fr)] lg:gap-7"
                    >
                        <div className="min-w-0 space-y-6">
                            <CheckoutHeader />

                            <CustomerDetails
                                customerName={customerName}
                                phoneNumber={phoneNumber}
                                profileLoaded={profileLoaded}
                                customerAuthenticated={customerAuthenticated}
                                loading={loading}
                                onCustomerNameChange={setCustomerName}
                                onPhoneNumberChange={setPhoneNumber}
                            />

                            <DeliveryDetails
                                shippingOption={shippingOption}
                                isLocker={isLocker}
                                lockerName={lockerName}
                                street={street}
                                suburb={suburb}
                                city={city}
                                postalCode={postalCode}
                                loading={loading}
                                onLockerNameChange={setLockerName}
                                onStreetChange={setStreet}
                                onSuburbChange={setSuburb}
                                onCityChange={setCity}
                                onPostalCodeChange={setPostalCode}
                            />
                        </div>

                        <OrderSummary
                            cartData={cartData}
                            subtotal={subtotal}
                            shippingFee={shippingFee}
                            totalToPay={totalToPay}
                            loading={loading}
                        />
                    </form>
                )}
            </main>
        </div>
    );
}
