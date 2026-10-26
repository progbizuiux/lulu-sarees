"use client";
import { useState } from "react";
import { useCreateAddress } from "@/hooks/useAddresses";
import { formatAddress, formatDate } from "@/lib/format";
import AddressForm from "@/components/my-account/AddressForm";

/** Delivery availability for the chosen pincode, from the backend's pincode check. */
function PincodeStatus({ pincode, check }) {
  if (!pincode) return null;
  if (check.isPending) return <p className="text-caption-1 text-secondary mt_12">Checking delivery to {pincode}…</p>;
  if (check.isError) return <p className="text-caption-1 text-secondary mt_12">We couldn't check delivery right now.</p>;
  if (!check.data.serviceable) {
    return (
      <p className="text-danger mt_12" role="alert">
        Sorry, we don't deliver to pincode {pincode} yet. Please use a different address.
      </p>
    );
  }
  return (
    <p className="text-success mt_12">
      ✓ We deliver to {pincode}
      {check.data.estimatedDelivery && <> · Expected by {formatDate(check.data.estimatedDelivery)}</>}
    </p>
  );
}

/**
 * Where to deliver.
 * - Logged in: pick a saved address, or add one (it's saved to the address book).
 * - Guest: fill in the address form; it's only used for this order.
 */
export default function AddressSection({
  user,
  addresses,
  isLoading,
  selectedAddressId,
  onSelectAddress,
  guestAddress,
  onGuestAddress,
  pincodeCheck,
  error,
}) {
  const createAddress = useCreateAddress();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingGuest, setIsEditingGuest] = useState(!guestAddress);

  const pincode = user ? addresses.find((a) => a.id === selectedAddressId)?.pincode : guestAddress?.pincode;

  let body;
  if (user && isLoading) {
    body = (
      <div className="spinner-border spinner-border-sm" role="status">
        <span className="visually-hidden">Loading your addresses…</span>
      </div>
    );
  } else if (user) {
    const showForm = isAdding || !addresses.length;
    body = (
      <>
        {addresses.length > 0 && (
          <div className="payment-box" role="radiogroup" aria-label="Delivery address">
            {addresses.map((address) => {
              const id = `checkout-address-${address.id}`;
              const checked = address.id === selectedAddressId;
              return (
                <div key={address.id} className={`payment-item ${checked ? "active" : ""}`}>
                  <label htmlFor={id} className="payment-header">
                    <input
                      type="radio"
                      name="delivery-address"
                      className="tf-check-rounded"
                      id={id}
                      checked={checked}
                      onChange={() => onSelectAddress(address.id)}
                    />
                    <span className="text-title">
                      {address.name} {address.label && <span className="text-secondary">· {address.label}</span>}
                    </span>
                  </label>
                  <div className="payment-body">
                    <p className="text-secondary mb-0">
                      {formatAddress(address)} · {address.phone}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {showForm ? (
          <AddressForm
            idPrefix="checkout-new-address"
            className="wd-form-address mt_20"
            title={addresses.length ? "Add a new address" : undefined}
            initialValues={{ isDefault: !addresses.length }}
            submitLabel="Save and use this address"
            isPending={createAddress.isPending}
            error={createAddress.error}
            onSubmit={(values) =>
              createAddress.mutate(values, {
                onSuccess: (saved) => {
                  setIsAdding(false);
                  if (saved?.id !== undefined) onSelectAddress(saved.id);
                },
              })
            }
            onCancel={addresses.length ? () => setIsAdding(false) : undefined}
          />
        ) : (
          <button
            type="button"
            className="lulu-link-button mt_12"
            onClick={() => {
              createAddress.reset();
              setIsAdding(true);
            }}
          >
            + Add a new address
          </button>
        )}
      </>
    );
  } else if (guestAddress && !isEditingGuest) {
    body = (
      <div className="payment-item active">
        <div className="payment-header">
          <span className="text-title">{guestAddress.name}</span>
        </div>
        <div className="payment-body">
          <p className="text-secondary mb_8">
            {formatAddress(guestAddress)} · {guestAddress.phone}
          </p>
          <button type="button" className="lulu-link-button" onClick={() => setIsEditingGuest(true)}>
            Change address
          </button>
        </div>
      </div>
    );
  } else {
    body = (
      <AddressForm
        idPrefix="checkout-guest-address"
        initialValues={guestAddress ?? {}}
        submitLabel="Use this address"
        showDefaultOption={false}
        onSubmit={(values) => {
          onGuestAddress({ ...values, name: [values.firstName, values.lastName].filter(Boolean).join(" ") });
          setIsEditingGuest(false);
        }}
        onCancel={guestAddress ? () => setIsEditingGuest(false) : undefined}
      />
    );
  }

  return (
    <div className="wrap">
      <h5 className="title">Delivery address</h5>
      {body}
      <PincodeStatus pincode={pincode} check={pincodeCheck} />
      {error && (
        <p className="text-danger small mt_12" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
