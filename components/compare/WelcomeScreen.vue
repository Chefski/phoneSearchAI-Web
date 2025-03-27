<script setup>
import { Button } from "@/components/ui/button";
import { Motion } from "motion-v";
import { defineEmits } from "vue";

const emit = defineEmits(["quickCompare"]);

const comparison1 = [
  {
    phones: [
      "iPhone 15 Pro",
      "Samsung S24 Ultra",
      "Google Pixel 9 Pro",
      "Xiaomi 15 Pro",
    ],
    label: "iPhone 15 Pro vs S24 Ultra vs Pixel 9 Pro vs Xiaomi 15 Pro",
  },
  {
    phones: ["Google Pixel 8", "iPhone 16"],
    label: "Pixel 8 vs iPhone 16",
  },
];

const comparison2 = [
  {
    phones: ["Google Pixel 8", "Google Pixel 8 Pro", "Google Pixel 8a"],
    label: "Pixel 8 vs Pixel 8 Pro vs Pixel 8a",
  },
  {
    phones: [
      "Samsung Fold 5",
      "Samsung Flip 5",
      "OnePlus Open",
      "Motorola Razr Plus (2024)",
    ],
    label: "Fold 5 vs Flip 5 vs OnePlus Open vs Razr Plus",
  },
  {
    phones: ["OnePlus Open", "Samsung Fold 5", "Samsung Z Flip 6"],
    label: "OnePlus Open vs Fold 5 vs vs Z Flip 6",
  },
];

const comparison3 = [
  {
    phones: ["Nothing Phone 2", "Pixel 7a", "iPhone 16"],
    label: "Nothing Phone 2 vs Pixel 7a vs iPhone 16",
  },
  {
    phones: ["iPhone SE", "Pixel 7a", "Galaxy S25", "Pixel 9a"],
    label: "iPhone SE vs Pixel 7a vs Galaxy S25 vs Pixel 9a",
  },
];
</script>

<template>
  <div class="flex flex-col items-center text-center gap-4">
    <Icon name="meteor-icons:robot" class="h-16 w-16" />
    <p class="text-lg font-semibold">Welcome to PhoneSearch AI</p>
    <p class="text-gray-500">
      Ask me to compare two or more phone models to see how they stack up.
    </p>
    <div class="flex flex-col gap-4 mt-2 items-center">
      <div class="flex flex-row gap-4">
        <template v-for="(comparison, index) in comparison1" :key="index">
          <Motion
            :animate="{ x: [0, 5, 0, -5, 0] }"
            :transition="{
              repeat: Infinity,
              duration: 8 + index * 0.5,
              ease: 'easeInOut',
            }"
          >
            <Button
              variant="outline"
              @click="emit('quickCompare', comparison.phones)"
            >
              {{ comparison.label }}
            </Button>
          </Motion>
        </template>
      </div>
      <!-- Other comparison rows -->
      <div class="flex flex-row gap-4">
        <template v-for="(comparison, index) in comparison2" :key="index">
          <Motion
            :animate="{ x: [0, -5, 0, 5, 0] }"
            :transition="{
              repeat: Infinity,
              duration: 7 + index * 0.7,
              ease: 'easeInOut',
            }"
          >
            <Button
              variant="outline"
              @click="emit('quickCompare', comparison.phones)"
            >
              {{ comparison.label }}
            </Button>
          </Motion>
        </template>
      </div>
      <div class="flex flex-row gap-4">
        <template v-for="(comparison, index) in comparison3" :key="index">
          <Motion
            :animate="{ x: [0, 4, 0, -4, 0] }"
            :transition="{
              repeat: Infinity,
              duration: 9 + index * 0.6,
              ease: 'easeInOut',
            }"
          >
            <Button
              variant="outline"
              @click="emit('quickCompare', comparison.phones)"
            >
              {{ comparison.label }}
            </Button>
          </Motion>
        </template>
      </div>
    </div>
  </div>
</template>
