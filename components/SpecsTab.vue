<script setup>
import { ref } from "vue";
import WelcomeScreen from "@/components/specs/WelcomeScreen.vue";
import ConversationHistory from "@/components/specs/ConversationHistory.vue";
import LoadingIndicator from "@/components/specs/LoadingIndicator.vue";
import MessageInput from "@/components/specs/MessageInput.vue";

const conversationHistory = ref([]);
const isFirstMessage = ref(true);
const isLoading = ref(false);

const sendSpecsRequest = async (queryText) => {
  if (!queryText.trim()) return;

  conversationHistory.value.push({
    type: "user",
    content: queryText,
  });

  if (isFirstMessage.value) {
    isFirstMessage.value = false;
  }

  isLoading.value = true;

  try {
    const response = await fetch("http://0.0.0.0:8080/specs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: queryText,
      }),
    });

    const data = await response.json();
    conversationHistory.value.push({
      type: "response",
      content: data,
    });
  } catch (error) {
    console.error("Error sending request:", error);
    conversationHistory.value.push({
      type: "error",
      content: "Sorry, there was an error processing your request.",
    });
  } finally {
    isLoading.value = false;
  }
};

// Handle example queries from welcome screen
const handleExampleQuery = (query) => {
  sendSpecsRequest(query);
};
</script>

<template>
  <WelcomeScreen 
    v-if="isFirstMessage" 
    @example-query="handleExampleQuery" 
  />

  <ConversationHistory 
    v-else 
    :conversationHistory="conversationHistory" 
  />

  <div class="mt-auto mb-2 px-4">
    <LoadingIndicator :isLoading="isLoading" />
    <MessageInput @send-message="sendSpecsRequest" />
  </div>
</template>
