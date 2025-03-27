<script setup>
import { Motion } from "motion-v";
import { defineProps } from "vue";

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  currentMessageIndex: {
    type: Number,
    default: 0,
  },
  loadingMessages: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="h-6 overflow-hidden relative">
    <Motion
      v-if="isLoading"
      layout
      :initial="{ y: 40, opacity: 0 }"
      :animate="{ y: 0, opacity: 1 }"
      :exit="{ y: -40, opacity: 0 }"
      :transition="{
        duration: 0.4,
        type: 'spring',
        stiffness: 400,
        damping: 40,
      }"
    >
      <Motion
        :key="currentMessageIndex"
        :initial="{ y: 40, opacity: 0 }"
        :animate="{ y: 0, opacity: 1 }"
        :exit="{ y: -40, opacity: 0, scale: 0.95 }"
        :transition="{
          duration: 0.4,
          type: 'spring',
          stiffness: 400,
          damping: 40,
          opacity: { duration: 0.2 },
        }"
      >
        <p class="ml-2 mb-1 text-xs font-semibold font-mono text-gray-500">
          {{ loadingMessages[currentMessageIndex] }}
        </p>
      </Motion>
    </Motion>
  </div>
</template>
