<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted, computed } from "vue";
import { Motion } from "motion-v";
import { useToast } from "@/components/ui/toast/use-toast";
import { useFocusToggle } from "@/composables/useFocusToggle";
import { usePhoneComparison } from "@/composables/usePhoneComparison";
import { debounce } from "@/utils/debounce";
import WelcomeScreen from "@/components/compare/WelcomeScreen.vue";
import ConversationHistory from "@/components/compare/ConversationHistory.vue";
import LoadingIndicator from "@/components/compare/LoadingIndicator.vue";
import FocusOptions from "@/components/compare/FocusOptions.vue";
import PhoneInputGrid from "@/components/compare/PhoneInputGrid.vue";

const props = defineProps({
  conversationHistory: {
    type: Array,
    required: true,
  },
  isFirstMessage: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits([
  "update:conversationHistory",
  "update:isFirstMessage",
]);

const { toast } = useToast();
const { isLoading, currentMessageIndex, loadingMessages, comparePhones, stopLoading } = usePhoneComparison();

const phonesToCompare = ref([
  { id: 1, name: "" },
  { id: 2, name: "" },
]);

const focusAccordionOpen = ref(null);
const showScrollButton = ref(false);

const { getActiveFocus } = useFocusToggle();
const sourcesCount = ref(3);

const sendCompareRequest = async () => {
  const validPhones = phonesToCompare.value
    .filter((phone) => phone.name.trim() !== "")
    .map((phone) => phone.name.trim());

  if (validPhones.length < 2) {
    toast({
      title: "Not enough phones to compare",
      description: "Please enter at least 2 phone models to compare",
      variant: "destructive",
    });
    return;
  }

  const userMessage = {
    type: "user",
    content: `Compare ${validPhones.join(
      " vs ",
    )} focusing on ${getActiveFocus()}`,
  };

  const updatedHistory = [...props.conversationHistory, userMessage];
  emit("update:conversationHistory", updatedHistory);

  if (props.isFirstMessage) {
    emit("update:isFirstMessage", false);
  }

  const responseObj = {
    type: "response",
    content: {
      phones: validPhones,
      focus: getActiveFocus(),
      comparison: "",
      sources: [],
    },
    isStreaming: true,
  };

  const historyWithResponse = [...updatedHistory, responseObj];
  emit("update:conversationHistory", historyWithResponse);

  // Update callback for streaming response
  const updateResponseCallback = (chunkData, isComplete) => {
    responseObj.content.phones = chunkData.phones || validPhones;
    responseObj.content.focus = chunkData.focus || getActiveFocus();
    responseObj.content.comparison = chunkData.comparison || "";
    responseObj.content.sources = chunkData.sources || [];

    if (isComplete || chunkData.status === "complete") {
      responseObj.isStreaming = false;
    }

    const updatedHistoryWithResponse = [
      ...updatedHistory,
      { ...responseObj },
    ];
    emit("update:conversationHistory", updatedHistoryWithResponse);
  };

  try {
    const result = await comparePhones(
      validPhones,
      getActiveFocus(),
      sourcesCount.value,
      updateResponseCallback
    );

    if (!result.success) {
      throw result.error || new Error("Failed to compare phones");
    }
  } catch (error) {
    console.error("Error sending comparison request:", error);
    emit("update:conversationHistory", [
      ...updatedHistory,
      {
        type: "error",
        content:
          "Sorry, there was an error processing your comparison request.",
      },
    ]);
  }
};

const quickCompare = (phones) => {
  phonesToCompare.value = phones.map((name, index) => ({
    id: index + 1,
    name,
  }));
  sendCompareRequest();
};

const hasEnoughPhones = computed(() => {
  const validPhones = phonesToCompare.value.filter(phone => phone.name.trim() !== "");
  return validPhones.length >= 2;
});

defineExpose({
  resetChat: () => {
    phonesToCompare.value = [
      { id: 1, name: "" },
      { id: 2, name: "" },
    ];
    stopLoading();
  },
});

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const checkScrollPosition = debounce(() => {
  showScrollButton.value = window.scrollY > 200;
}, 100);

onMounted(() => {
  window.addEventListener("scroll", checkScrollPosition);
});

onUnmounted(() => {
  window.removeEventListener("scroll", checkScrollPosition);
  stopLoading();
});
</script>

<template>
  <WelcomeScreen v-if="isFirstMessage" @quick-compare="quickCompare" />

  <ConversationHistory v-else :conversation-history="conversationHistory" />

  <div class="mt-auto mb-2">
    <LoadingIndicator
      :is-loading="isLoading"
      :current-message-index="currentMessageIndex"
      :loading-messages="loadingMessages"
    />

    <FocusOptions
      v-model:accordion-open="focusAccordionOpen"
      @update:sources-count="sourcesCount = $event"
    />

    <PhoneInputGrid
      v-model:phones="phonesToCompare"
      :has-enough-phones="hasEnoughPhones"
      @compare="sendCompareRequest"
    />
  </div>

  <Motion
    v-if="showScrollButton"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :exit="{ opacity: 0 }"
    :transition="{ duration: 0.4 }"
  >
    <button
      @click="scrollToTop"
      class="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-primary/90 z-50"
      aria-label="Scroll to top"
    >
      <Icon name="tabler:chevron-up" class="w-6 h-6" />
    </button>
  </Motion>
</template>
