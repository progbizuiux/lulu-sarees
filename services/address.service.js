import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapAddress, mapAddressInput, mapAddressList } from "@/lib/mappers/address.mapper";

const mocks = () => import("@/lib/mocks/addresses");

/** The logged-in customer's saved addresses. @returns {Promise<import("@/lib/mappers/address.mapper").Address[]>} */
async function list() {
  if (config.useMocks) return (await mocks()).listAddresses();
  return mapAddressList(unwrap(await apiClient.get(ENDPOINTS.addresses.list)));
}

/** @returns {Promise<import("@/lib/mappers/address.mapper").Address>} */
async function create(values) {
  if (config.useMocks) return (await mocks()).createAddress(values);
  return mapAddress(unwrap(await apiClient.post(ENDPOINTS.addresses.create, mapAddressInput(values))));
}

/** @returns {Promise<import("@/lib/mappers/address.mapper").Address>} */
async function update(addressId, values) {
  if (config.useMocks) return (await mocks()).updateAddress(addressId, values);
  return mapAddress(unwrap(await apiClient.put(ENDPOINTS.addresses.item(addressId), mapAddressInput(values))));
}

async function remove(addressId) {
  if (config.useMocks) return (await mocks()).deleteAddress(addressId);
  await apiClient.delete(ENDPOINTS.addresses.item(addressId));
}

export const addressService = { list, create, update, remove };
