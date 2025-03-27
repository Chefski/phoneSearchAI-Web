<script setup>
import { Button } from "@/components/ui/button";
import { Motion } from "motion-v";

const emit = defineEmits(["example-query"]);

const sendExampleQuery = (query) => {
  emit("example-query", query);
};

const phoneList1 = ["Samsung S25", "iPhone 16", "Google Pixel 9"];

const phoneList2 = [
  "Xiaomi 15 Pro",
  "OnePlus 13",
  "Nothing Phone 3",
  "Oppo A10",
];
</script>

<template>
  <div class="flex flex-col items-center text-center gap-4">
    <Icon name="meteor-icons:robot" class="h-16 w-16" />
    <div>
      <p class="text-lg font-semibold">Welcome to PhoneSearch AI</p>
      <p class="text-gray-500">
        Ask me about any phone model to get detailed specifications.
      </p>
    </div>
    <div class="flex flex-col gap-4 mt-2 items-center">
      <div class="flex flex-row gap-4">
        <template v-for="(phone, index) in phoneList1" :key="index">
          <Motion
            :animate="{ x: [0, 5, 0, -5, 0] }"
            :transition="{
              repeat: Infinity,
              duration: 8 + index * 0.5,
              ease: 'easeInOut',
            }"
          >
            <Button variant="outline" @click="sendExampleQuery(phone)">{{
              phone
            }}</Button>
          </Motion>
        </template>
      </div>
      <div class="flex flex-row gap-4">
        <template v-for="(phone, index) in phoneList2" :key="index">
          <Motion
            :animate="{ x: [0, -5, 0, 5, 0] }"
            :transition="{
              repeat: Infinity,
              duration: 7 + index * 0.7,
              ease: 'easeInOut',
            }"
          >
            <Button variant="outline" @click="sendExampleQuery(phone)">{{
              phone
            }}</Button>
          </Motion>
        </template>
      </div>
    </div>
  </div>
</template>
