<script setup>
import { ref, defineProps, defineEmits } from "vue";
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
      " vs "
    )} focusing on ${getActiveFocus()}`,
  };

  const updatedHistory = [...props.conversationHistory, userMessage];

  emit("update:conversationHistory", updatedHistory);

  if (props.isFirstMessage) {
    emit("update:isFirstMessage", false);
  }

  startLoading();

  try {
    const response = await fetch("http://0.0.0.0:8080/compare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        focus: getActiveFocus(),
        phones: validPhones,
      }),
    });

    const data = await response.json();

    emit("update:conversationHistory", [
      ...updatedHistory,
      {
        type: "response",
        content: data,
      },
    ]);
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

    <FocusOptions v-model:accordion-open="focusAccordionOpen" />

    <PhoneInputGrid
      v-model:phones="phonesToCompare"
      @compare="sendCompareRequest"
    />
  </div>
</template>
