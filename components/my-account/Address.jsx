"use client";
import React, { useState } from "react";
import { useAddresses, useCreateAddress, useDeleteAddress, useUpdateAddress } from "@/hooks/useAddresses";
import AddressForm from "./AddressForm";

/** "My Address": the customer's saved addresses (default first), from the address service. */
export default function Address() {
  const { data: addresses = [], isPending, isError, error, refetch, isFetching } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const openAdd = () => {
    createAddress.reset();
    setIsAdding((open) => !open);
  };

  const toggleEdit = (id) => {
    updateAddress.reset();
    setEditingId((current) => (current === id ? null : id));
  };

  const handleDelete = (address) => {
    if (window.confirm(`Delete the address for ${address.name || "this person"}?`)) {
      deleteAddress.mutate(address.id);
    }
  };

  const makeDefault = (address) => updateAddress.mutate({ id: address.id, values: { ...address, isDefault: true } });

  let list;
  if (isPending) {
    list = (
      <div className="py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading your addresses…</span>
        </div>
      </div>
    );
  } else if (isError) {
    list = (
      <div className="py-4">
        <p className="mb_12">{error?.message}</p>
        <button type="button" className="tf-btn btn-fill" onClick={() => refetch()} disabled={isFetching}>
          <span className="text text-button">Try again</span>
        </button>
      </div>
    );
  } else if (!addresses.length) {
    list = !isAdding && <p className="py-4">You haven't saved any addresses yet.</p>;
  } else {
    list = (
      <div className="list-account-address">
        {addresses.map((address) => {
          const isDeleting = deleteAddress.isPending && deleteAddress.variables === address.id;
          return (
            <div className="account-address-item" key={address.id} style={{ opacity: isDeleting ? 0.5 : 1 }}>
              <h6 className="mb_20">
                {address.label || "Address"}
                {address.isDefault && <span className="text-secondary fw-normal"> · Default</span>}
              </h6>
              <p>{address.name}</p>
              <p>{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>
                {address.city}, {address.state} {address.pincode}
              </p>
              <p className="mb_10">{address.phone}</p>
              <div className="d-flex gap-10 justify-content-center flex-wrap">
                <button
                  type="button"
                  className="tf-btn radius-4 btn-fill justify-content-center btn-edit-address"
                  onClick={() => toggleEdit(address.id)}
                >
                  <span className="text">{editingId === address.id ? "Close" : "Edit"}</span>
                </button>
                <button
                  type="button"
                  className="tf-btn radius-4 btn-outline justify-content-center btn-delete-address"
                  onClick={() => handleDelete(address)}
                  disabled={isDeleting}
                >
                  <span className="text">{isDeleting ? "Deleting…" : "Delete"}</span>
                </button>
                {!address.isDefault && (
                  <button
                    type="button"
                    className="tf-btn radius-4 btn-outline justify-content-center"
                    onClick={() => makeDefault(address)}
                    disabled={updateAddress.isPending}
                  >
                    <span className="text">Set as default</span>
                  </button>
                )}
              </div>
              {editingId === address.id && (
                <AddressForm
                  idPrefix={`edit-address-${address.id}`}
                  className="edit-form-address wd-form-address d-block"
                  title="Edit address"
                  initialValues={address}
                  submitLabel="Save changes"
                  isPending={updateAddress.isPending}
                  error={updateAddress.error}
                  onSubmit={(values) =>
                    updateAddress.mutate({ id: address.id, values }, { onSuccess: () => setEditingId(null) })
                  }
                  onCancel={() => toggleEdit(address.id)}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="my-account-content">
      <div className="account-address">
        <div className="text-center widget-inner-address">
          <button
            type="button"
            className="tf-btn btn-fill radius-4 mb_20 btn-address"
            onClick={openAdd}
            aria-expanded={isAdding}
          >
            <span className="text text-caption-1">Add a new address</span>
          </button>
          {isAdding && (
            <AddressForm
              idPrefix="new-address"
              className="show-form-address wd-form-address d-block"
              title="Add a new address"
              initialValues={{ isDefault: !addresses.length }}
              submitLabel="Add address"
              isPending={createAddress.isPending}
              error={createAddress.error}
              onSubmit={(values) => createAddress.mutate(values, { onSuccess: () => setIsAdding(false) })}
              onCancel={() => setIsAdding(false)}
            />
          )}
          {list}
        </div>
      </div>
    </div>
  );
}
