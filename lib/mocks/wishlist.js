// Fake wishlist API (stores product ids).
import { findProduct } from "./products";
import { delay, mockError, readStore, writeStore } from "./utils";

const STORE_KEY = "wishlist";

function build(ids) {
  const items = ids.map(findProduct).filter(Boolean);
  return { productIds: items.map((item) => item.id), items };
}

export async function getWishlist() {
  await delay();
  return build(readStore(STORE_KEY, []));
}

export async function addToWishlist(productId) {
  await delay();
  if (!findProduct(productId)) throw mockError(404, "This product could not be found.");
  const ids = readStore(STORE_KEY, []);
  if (!ids.some((id) => String(id) === String(productId))) ids.push(productId);
  writeStore(STORE_KEY, ids);
  return build(ids);
}

export async function removeFromWishlist(productId) {
  await delay();
  const ids = readStore(STORE_KEY, []).filter((id) => String(id) !== String(productId));
  writeStore(STORE_KEY, ids);
  return build(ids);
}
