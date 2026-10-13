"use client";

import { collections } from "@/data/collections";
import CategoryStrip from "@/components/common/CategoryStrip";
export default function Collections() {
  return (
    <CategoryStrip title="Categories you might like" items={collections} />
  );
}
