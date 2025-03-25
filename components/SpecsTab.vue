<script setup>
import { ref, defineProps, defineEmits } from "vue";
import WelcomeScreen from "@/components/specs/WelcomeScreen.vue";
import ConversationHistory from "@/components/specs/ConversationHistory.vue";
import LoadingIndicator from "@/components/specs/LoadingIndicator.vue";
import MessageInput from "@/components/specs/MessageInput.vue";

const props = defineProps({
  conversationHistory: {
    type: Array,
    required: true
  },
  isFirstMessage: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:conversationHistory', 'update:isFirstMessage']);

const isLoading = ref(false);

const sendSpecsRequest = async (queryText) => {
  if (!queryText.trim()) return;

  const updatedHistory = [...props.conversationHistory, {
    type: "user",
    content: queryText,
  }];

  emit('update:conversationHistory', updatedHistory);

  if (props.isFirstMessage) {
    emit('update:isFirstMessage', false);
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

    emit('update:conversationHistory', [...updatedHistory, {
      type: "response",
      content: data,
    }]);
  } catch (error) {
    console.error("Error sending request:", error);
    emit('update:conversationHistory', [...updatedHistory, {
      type: "error",
      content: "Sorry, there was an error processing your request.",
    }]);
  } finally {
    isLoading.value = false;
  }
};

const handleExampleQuery = (query) => {
  sendSpecsRequest(query);
};

defineExpose({
  resetChat: () => {
    isLoading.value = false;
  }
});
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
