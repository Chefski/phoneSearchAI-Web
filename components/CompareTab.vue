<script setup>
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ref } from "vue";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/toast/use-toast";
import { Motion } from "motion-v";
import { useFocusToggle } from "@/composables/useFocusToggle";
import WelcomeScreen from "@/components/compare/WelcomeScreen.vue";
import ConversationHistory from "@/components/compare/ConversationHistory.vue";
import LoadingIndicator from "@/components/compare/LoadingIndicator.vue";
import FocusOptions from "@/components/compare/FocusOptions.vue";
import PhoneInputGrid from "@/components/compare/PhoneInputGrid.vue";

const { toast } = useToast();

const phonesToCompare = ref([
  { id: 1, name: "" },
  { id: 2, name: "" },
]);

const isLoading = ref(false);
const conversationHistory = ref([]);
const isFirstMessage = ref(true);
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

const addPhoneInput = () => {
  if (phonesToCompare.value.length >= 6) return;
  const newId = phonesToCompare.value.length + 1;
  phonesToCompare.value.push({ id: newId, name: "" });
};

const removePhone = (id) => {
  phonesToCompare.value = phonesToCompare.value.filter(
    (phone) => phone.id !== id
  );
};

const { focusOptions, toggleFocus, getActiveFocus } = useFocusToggle();

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

  conversationHistory.value.push({
    type: "user",
    content: `Compare ${validPhones.join(
      " vs "
    )} focusing on ${getActiveFocus()}`,
  });

  if (isFirstMessage.value) {
    isFirstMessage.value = false;
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
    // console.log("API Response:", data);

    conversationHistory.value.push({
      type: "response",
      content: data,
    });
  } catch (error) {
    console.error("Error sending comparison request:", error);
    conversationHistory.value.push({
      type: "error",
      content: "Sorry, there was an error processing your comparison request.",
    });
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
</script>

<template>
  <WelcomeScreen 
    v-if="isFirstMessage"
    @quick-compare="quickCompare"
  />

  <ConversationHistory 
    v-else
    :conversation-history="conversationHistory"
  />

  <div class="mt-auto mb-2">
    <LoadingIndicator
      :is-loading="isLoading"
      :current-message-index="currentMessageIndex"
      :loading-messages="loadingMessages"
    />

    <FocusOptions
      v-model:accordion-open="focusAccordionOpen"
    />

    <PhoneInputGrid
      v-model:phones="phonesToCompare"
      @compare="sendCompareRequest"
    />
  </div>
</template>
