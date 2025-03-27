<script setup>
import { Motion } from "motion-v";
import { ref, onUnmounted } from "vue";

const props = defineProps({
  isLoading: Boolean,
});

const loadingMessages = [
  "🔍 Searching for sources",
  "📱 Analyzing sources",
  "🤖 Processing your request...",
  "📊 Gathering detailed information...",
  "🔄 Comparing data sources...",
];

const currentMessageIndex = ref(0);
let messageInterval;

// Start message rotation when loading begins
const startMessageRotation = () => {
  currentMessageIndex.value = 0;
  messageInterval = setInterval(() => {
    currentMessageIndex.value =
      (currentMessageIndex.value + 1) % loadingMessages.length;
  }, 4000);
};

// Watch for loading state changes
watch(
  () => props.isLoading,
  (newValue) => {
    if (newValue) {
      startMessageRotation();
    } else {
      clearInterval(messageInterval);
    }
  },
  { immediate: true },
);

// Clean up interval when component is destroyed
onUnmounted(() => {
  clearInterval(messageInterval);
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
