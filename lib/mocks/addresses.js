// Fake address book for the logged-in user. The first address becomes the default;
// only one address can be the default at a time.
import { delay, mockError, readStore, requireUser, writeStore } from "./utils";

const STORE_KEY = "addresses";
const readAddresses = () => readStore(STORE_KEY, []);
const saveAddresses = (addresses) => writeStore(STORE_KEY, addresses);

function withSingleDefault(addresses, defaultId) {
  if (!addresses.length) return addresses;
  const target = defaultId ?? addresses.find((address) => address.isDefault)?.id ?? addresses[0].id;
  return addresses.map((address) => ({ ...address, isDefault: String(address.id) === String(target) }));
}

const toAddress = (input, id) => ({
  id,
  label: input.label ?? "",
  firstName: input.firstName ?? "",
  lastName: input.lastName ?? "",
  name: [input.firstName, input.lastName].filter(Boolean).join(" "),
  phone: input.phone ?? "",
  line1: input.line1 ?? "",
  line2: input.line2 ?? "",
  city: input.city ?? "",
  state: input.state ?? "",
  pincode: input.pincode ?? "",
  country: input.country ?? "India",
  isDefault: Boolean(input.isDefault),
});

// Default first, then newest.
const sorted = (addresses) => [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || b.id - a.id);

export async function listAddresses() {
  await delay();
  requireUser();
  return sorted(readAddresses());
}

export async function createAddress(input) {
  await delay();
  requireUser();
  const addresses = readAddresses();
  const address = toAddress(input, Date.now());
  const next = withSingleDefault([...addresses, address], input.isDefault || !addresses.length ? address.id : undefined);
  saveAddresses(next);
  return next.find((item) => item.id === address.id);
}

export async function updateAddress(addressId, input) {
  await delay();
  requireUser();
  const addresses = readAddresses();
  const existing = addresses.find((address) => String(address.id) === String(addressId));
  if (!existing) throw mockError(404, "This address no longer exists.");
  const updated = { ...existing, ...toAddress({ ...existing, ...input }, existing.id) };
  // Unticking "default" on the default address is ignored: there must always be one.
  const next = withSingleDefault(
    addresses.map((address) => (address.id === existing.id ? updated : address)),
    input.isDefault ? existing.id : undefined
  );
  saveAddresses(next);
  return next.find((item) => item.id === existing.id);
}

export async function deleteAddress(addressId) {
  await delay();
  requireUser();
  const next = withSingleDefault(readAddresses().filter((address) => String(address.id) !== String(addressId)));
  saveAddresses(next);
}
