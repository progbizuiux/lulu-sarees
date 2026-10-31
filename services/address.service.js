import { apiClient, unwrap } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapAddress, mapAddressInput, mapAddressList } from "@/lib/mappers/address.mapper";

const mocks = () => import("@/lib/mocks/addresses");

// The ERP saves addresses with ids for the country and state. India's id and its states are loaded
// once (get-list-of-countries, get-list-of-states/{countryID}) and the form's state name is matched.
let indiaPromise = null;
function loadIndia() {
  if (!indiaPromise) {
    indiaPromise = (async () => {
      const countries = unwrap(await apiClient.get(ENDPOINTS.addresses.countries));
      const india = countries.find((country) => country.code === "IN");
      if (!india) throw new ApiError({ message: "India is missing from the country list.", status: 500 });
      const states = unwrap(await apiClient.get(ENDPOINTS.addresses.states(india.countryID)));
      return { countryId: india.countryID, states };
    })().catch((error) => {
      indiaPromise = null; // try again next time
      throw error;
    });
  }
  return indiaPromise;
}

async function toRequestBody(values, addressId = 0) {
  const { countryId, states } = await loadIndia();
  const wanted = String(values.state ?? "").trim().toLowerCase();
  const state = states.find((item) => item.name.trim().toLowerCase() === wanted);
  if (!state) {
    throw new ApiError({ message: "Choose your state from the list.", status: 400, fieldErrors: { state: "Choose your state from the list." } });
  }
  return mapAddressInput(values, { addressId, stateId: state.stateID, countryId });
}

/** GET get-address-list: the logged-in customer's addresses, default first. */
async function list() {
  if (config.useMocks) return (await mocks()).listAddresses();
  return mapAddressList(unwrap(await apiClient.get(ENDPOINTS.addresses.list)));
}

/** POST save-address with addressID 0. The first address becomes the default. */
async function create(values) {
  if (config.useMocks) return (await mocks()).createAddress(values);
  return mapAddress(unwrap(await apiClient.post(ENDPOINTS.addresses.save, await toRequestBody(values))));
}

/** POST save-address with the address's id. Also used for "Set as default". */
async function update(addressId, values) {
  if (config.useMocks) return (await mocks()).updateAddress(addressId, values);
  return mapAddress(unwrap(await apiClient.post(ENDPOINTS.addresses.save, await toRequestBody(values, addressId))));
}

/** POST remove-address/{id} */
async function remove(addressId) {
  if (config.useMocks) return (await mocks()).deleteAddress(addressId);
  await apiClient.post(ENDPOINTS.addresses.remove(addressId), {});
}

export const addressService = { list, create, update, remove };
