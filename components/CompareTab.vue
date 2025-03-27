<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from "vue";
import { Motion } from "motion-v";
import { useToast } from "@/components/ui/toast/use-toast";
import { useFocusToggle } from "@/composables/useFocusToggle";
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

const phonesToCompare = ref([
  { id: 1, name: "" },
  { id: 2, name: "" },
]);

const isLoading = ref(false);
const currentMessageIndex = ref(0);
const focusAccordionOpen = ref(null);
const showScrollButton = ref(false);

const loadingMessages = [
  "🔍 Searching for sources",
  "📱 Analyzing phone models",
  "🤖 Processing your comparison request...",
  "📊 Gathering detailed information...",
  "🔄 Comparing specifications...",
];

let messageInterval;

const startLoading = () => {
  isLoading.value = true;
  currentMessageIndex.value = 0;
  messageInterval = setInterval(() => {
    currentMessageIndex.value =
      (currentMessageIndex.value + 1) % loadingMessages.length;
  }, 4000);
};

const stopLoading = () => {
  isLoading.value = false;
  clearInterval(messageInterval);
};

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

  startLoading();

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

  try {
    const response = await fetch("http://0.0.0.0:8080/compare/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        focus: getActiveFocus(),
        phones: validPhones,
        max_sources: sourcesCount.value,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.trim()) {
          try {
            const chunkData = JSON.parse(line);

            // Update the response object with the latest data
            responseObj.content.phones = chunkData.phones || validPhones;
            responseObj.content.focus = chunkData.focus || getActiveFocus();
            responseObj.content.comparison = chunkData.comparison || "";
            responseObj.content.sources = chunkData.sources || [];

            // If this is the final chunk, mark streaming as complete
            if (chunkData.status === "complete") {
              responseObj.isStreaming = false;
            }

            // Create a new array with the updated response object
            const updatedHistoryWithResponse = [
              ...updatedHistory,
              { ...responseObj },
            ];
            emit("update:conversationHistory", updatedHistoryWithResponse);
          } catch (e) {
            console.error("Error parsing JSON chunk:", e, line);
          }
        }
      }
    }

    // Process any remaining data in the buffer
    if (buffer.trim()) {
      try {
        const chunkData = JSON.parse(buffer);
        responseObj.content.phones = chunkData.phones || validPhones;
        responseObj.content.focus = chunkData.focus || getActiveFocus();
        responseObj.content.comparison = chunkData.comparison || "";
        responseObj.content.sources = chunkData.sources || [];
        responseObj.isStreaming = false;

        const finalHistory = [...updatedHistory, { ...responseObj }];
        emit("update:conversationHistory", finalHistory);
      } catch (e) {
        console.error("Error parsing final JSON chunk:", e, buffer);
      }
    }

    // Ensure streaming is marked as complete
    if (responseObj.isStreaming) {
      responseObj.isStreaming = false;
      const finalHistory = [...updatedHistory, { ...responseObj }];
      emit("update:conversationHistory", finalHistory);
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
  } finally {
    stopLoading();
  }
};

const quickCompare = (phones) => {
  phonesToCompare.value = phones.map((name, index) => ({
    id: index + 1,
    name,
  }));
  sendCompareRequest();
};

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

const checkScrollPosition = () => {
  showScrollButton.value = window.scrollY > 200;
};

onMounted(() => {
  window.addEventListener("scroll", checkScrollPosition);
});

onUnmounted(() => {
  window.removeEventListener("scroll", checkScrollPosition);
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
