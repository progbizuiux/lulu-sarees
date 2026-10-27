"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { keepPreviousData } from "@tanstack/react-query";
import { useUser } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useAddresses } from "@/hooks/useAddresses";
import { useCheckoutSummary, usePincodeCheck, usePlaceOrder, useVerifyPayment } from "@/hooks/useCheckout";
import { EMPTY_CART } from "@/lib/mappers/cart.mapper";
import { config } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { validateEmail } from "@/lib/validation";
import { openRazorpay } from "@/lib/payments/razorpay";
import { FormAlert } from "@/components/auth/FormMessages";
import ContactSection from "@/components/checkout/ContactSection";
import AddressSection from "@/components/checkout/AddressSection";
import PaymentSection from "@/components/checkout/PaymentSection";
import OrderSummary from "@/components/checkout/OrderSummary";
import MockPaymentDialog from "@/components/checkout/MockPaymentDialog";

const NOTE_MAX_LENGTH = 500;

function Spinner({ label }) {
  return (
    <section className="flat-spacing">
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">{label}</span>
        </div>
      </div>
    </section>
  );
}

/**
 * Checkout: contact → delivery address → payment → place order.
 *
 * - Every total comes from the backend's checkout summary (refetched when the address, coupon or payment changes).
 * - The order is placed once. For online payment, Razorpay opens next; if it fails or is cancelled the same
 *   order can be paid again ("Retry payment") instead of creating a new one.
 * - Success is only shown after the backend confirms the payment. If the gateway says "paid" but the backend
 *   can't confirm yet, the details lock and the customer is told not to pay again.
 */
export default function Checkout() {
  const router = useRouter();
  const { data: user, isPending: isUserLoading } = useUser();
  const { data: cart = EMPTY_CART, isPending: isCartLoading } = useCart();
  const { data: addresses = [], isPending: isAddressesLoading } = useAddresses({ enabled: Boolean(user) });
  const placeOrder = usePlaceOrder();
  const verifyPayment = useVerifyPayment();

  const [email, setEmail] = useState("");
  const [guestAddress, setGuestAddress] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [note, setNote] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState(null); // { type: "danger" | "warning", text }
  const [pendingPayment, setPendingPayment] = useState(null); // order placed, online payment not done yet
  const [paidButUnverified, setPaidButUnverified] = useState(null); // gateway said paid; backend not confirmed yet
  const [isPaying, setIsPaying] = useState(false);
  const [mockPayment, setMockPayment] = useState(null); // test-mode payment window
  const [isLeaving, setIsLeaving] = useState(false); // order done, going to the success page

  // Pre-select the default saved address.
  useEffect(() => {
    if (!user || !addresses.length || addresses.some((a) => a.id === selectedAddressId)) return;
    setSelectedAddressId((addresses.find((a) => a.isDefault) ?? addresses[0]).id);
  }, [user, addresses, selectedAddressId]);

  const address = user ? addresses.find((a) => a.id === selectedAddressId) ?? null : guestAddress;
  const pincode = address?.pincode;
  const pincodeCheck = usePincodeCheck(pincode);
  const hasItems = cart.items.length > 0;

  const summaryQuery = useCheckoutSummary(
    {
      paymentMethod,
      addressId: user ? selectedAddressId ?? undefined : undefined,
      pincode: pincode || undefined,
    },
    { enabled: hasItems && !isLeaving, placeholderData: keepPreviousData }
  );
  const total = summaryQuery.data?.summary.total;

  const pincodeBlocked = pincodeCheck.data?.serviceable === false;
  const codAvailable = summaryQuery.data?.codAvailable !== false && pincodeCheck.data?.codAvailable !== false;
  const codUnavailableReason =
    pincodeCheck.data?.codAvailable === false
      ? `Cash on Delivery isn't available for pincode ${pincode}.`
      : "Cash on Delivery isn't available for this order.";

  // If COD stops being available (new address, bigger order), switch to online payment.
  useEffect(() => {
    if (paymentMethod === "cod" && !codAvailable) setPaymentMethod("online");
  }, [paymentMethod, codAvailable]);

  // A started online payment belongs to one exact order. If the cart, coupon, address or payment
  // method changes, the next click places a fresh order.
  const orderKey = JSON.stringify([
    cart.items.map((item) => [item.id, item.quantity]),
    cart.coupon?.code,
    paymentMethod,
    user ? selectedAddressId : guestAddress,
  ]);
  useEffect(() => {
    setPendingPayment(null);
  }, [orderKey]);

  const isBusy = placeOrder.isPending || verifyPayment.isPending || isPaying;
  const isLocked = isBusy || Boolean(paidButUnverified);

  const goToSuccess = (order) => {
    setIsLeaving(true);
    router.replace(`/order-success?id=${encodeURIComponent(order.id)}&order=${encodeURIComponent(order.number)}`);
  };

  // Opens the payment window. Resolves with { status: "paid" | "failed" | "cancelled", ... }.
  const openPaymentWindow = ({ order, payment }) => {
    if (payment.key) {
      return openRazorpay({
        payment,
        order,
        prefill: { name: address?.name, email: user?.email ?? email.trim(), phone: address?.phone },
      });
    }
    if (config.useMocks) {
      return new Promise((resolve) => setMockPayment({ order, amount: total ?? payment.amount, resolve }));
    }
    return Promise.resolve({
      status: "failed",
      message: "Online payment isn't available right now. Please choose Cash on Delivery or try again later.",
    });
  };

  // Ask the backend to check the payment. Only its answer counts, never the payment window's.
  const confirmPayment = (result, outcome) => {
    verifyPayment.mutate(
      {
        orderId: result.order.id,
        gatewayOrderId: outcome.gatewayOrderId,
        gatewayPaymentId: outcome.gatewayPaymentId,
        signature: outcome.signature,
      },
      {
        onSuccess: (order) => {
          setPendingPayment(null);
          setPaidButUnverified(null);
          goToSuccess(order ?? result.order);
        },
        onError: () => {
          setPaidButUnverified({ result, outcome });
          setMessage({
            type: "warning",
            text: `We received your payment but couldn't confirm it yet. Please don't pay again. Press "Check payment again", or contact us with order #${result.order.number}.`,
          });
        },
      }
    );
  };

  const pay = async (result) => {
    setMessage(null);
    setIsPaying(true);
    const outcome = await openPaymentWindow(result);
    setIsPaying(false);
    setMockPayment(null);

    if (outcome.status === "paid") confirmPayment(result, outcome);
    else if (outcome.status === "failed") {
      setMessage({ type: "danger", text: `Payment failed: ${outcome.message} Your order is saved, so you can try again.` });
    } else {
      setMessage({ type: "warning", text: "Payment was cancelled. Your order is saved. Press “Retry payment” when you're ready." });
    }
  };

  const handlePlaceOrder = () => {
    if (isBusy) return;
    setMessage(null);

    if (paidButUnverified) return confirmPayment(paidButUnverified.result, paidButUnverified.outcome);
    if (pendingPayment) return pay(pendingPayment);

    const errors = {};
    if (!user) {
      const emailError = validateEmail(email.trim());
      if (emailError) errors.email = emailError;
    }
    if (!address) {
      errors.address = user ? "Choose a delivery address." : "Fill in your delivery address and press “Use this address”.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setMessage({ type: "danger", text: "Please check the details above." });
      return;
    }
    if (pincodeBlocked) return;

    placeOrder.mutate(
      {
        paymentMethod,
        addressId: user ? address.id : undefined,
        address: user ? undefined : address,
        email: user ? undefined : email.trim(),
        note: note.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          if (!result.payment) goToSuccess(result.order); // COD: done
          else {
            setPendingPayment(result);
            pay(result);
          }
        },
        onError: (error) => {
          setFieldErrors((current) => ({ ...current, ...error.fieldErrors }));
          setMessage({ type: "danger", text: error.message });
        },
      }
    );
  };

  if (isLeaving) return <Spinner label="Opening your order confirmation…" />;
  if (isCartLoading || isUserLoading) return <Spinner label="Loading checkout…" />;
  if (!hasItems) {
    return (
      <section className="flat-spacing">
        <div className="container text-center py-5">
          <h4 className="mb_12">Your cart is empty</h4>
          <p className="text-secondary mb_20">Add something you love, then come back to check out.</p>
          <Link href="/shop-default-grid" className="tf-btn btn-fill">
            <span className="text text-button">Explore products</span>
          </Link>
        </div>
      </section>
    );
  }

  let buttonLabel;
  const withTotal = (text) => (total !== undefined ? `${text} · ${formatPrice(total)}` : text);
  if (placeOrder.isPending) buttonLabel = "Placing your order…";
  else if (isPaying) buttonLabel = "Waiting for payment…";
  else if (verifyPayment.isPending) buttonLabel = "Confirming your payment…";
  else if (paidButUnverified) buttonLabel = "Check payment again";
  else if (pendingPayment) buttonLabel = withTotal("Retry payment");
  else buttonLabel = withTotal(paymentMethod === "cod" ? "Place order" : "Pay now");

  return (
    <section>
      <div className="container">
        <div className="row">
          <div className="col-xl-6">
            {/* `inert` locks the details while paying, so the order can't change underneath the payment. */}
            <div className="flat-spacing tf-page-checkout" inert={isLocked} style={{ opacity: isLocked ? 0.7 : 1 }}>
              <ContactSection
                user={user}
                email={email}
                onEmailChange={(value) => {
                  setEmail(value);
                  setFieldErrors((current) => ({ ...current, email: undefined }));
                }}
                error={fieldErrors.email}
              />
              <AddressSection
                user={user}
                addresses={addresses}
                isLoading={Boolean(user) && isAddressesLoading}
                selectedAddressId={selectedAddressId}
                onSelectAddress={(id) => {
                  setSelectedAddressId(id);
                  setFieldErrors((current) => ({ ...current, address: undefined }));
                }}
                guestAddress={guestAddress}
                onGuestAddress={(value) => {
                  setGuestAddress(value);
                  setFieldErrors((current) => ({ ...current, address: undefined }));
                }}
                pincodeCheck={pincodeCheck}
                error={fieldErrors.address}
              />
              <div className="wrap">
                <h5 className="title">Order note (optional)</h5>
                <div className="info-box">
                  <textarea
                    placeholder="Anything we should know? e.g. delivery instructions"
                    value={note}
                    maxLength={NOTE_MAX_LENGTH}
                    onChange={(event) => setNote(event.target.value)}
                    aria-label="Order note"
                  />
                </div>
              </div>
              <PaymentSection
                value={paymentMethod}
                onChange={setPaymentMethod}
                codAvailable={codAvailable}
                codUnavailableReason={codUnavailableReason}
                disabled={isLocked}
              />
            </div>
            <div className="pb-5">
              <FormAlert type={message?.type}>{message?.text}</FormAlert>
              <button
                type="button"
                className="tf-btn btn-reset w-100"
                onClick={handlePlaceOrder}
                disabled={isBusy || pincodeBlocked || !summaryQuery.data}
                aria-busy={isBusy}
              >
                {buttonLabel}
              </button>
              <p className="text-caption-1 text-secondary mt_12">
                By placing this order you agree to our <Link href="/term-of-use">Terms of Use</Link>.
              </p>
            </div>
          </div>
          <div className="col-xl-1">
            <div className="line-separation" />
          </div>
          <div className="col-xl-5">
            <OrderSummary cart={cart} summaryQuery={summaryQuery} disabled={isLocked} />
          </div>
        </div>
      </div>
      {mockPayment && (
        <MockPaymentDialog order={mockPayment.order} amount={mockPayment.amount} onResult={mockPayment.resolve} />
      )}
    </section>
  );
}
