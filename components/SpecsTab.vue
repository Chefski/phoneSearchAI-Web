<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from "vue";
import WelcomeScreen from "@/components/specs/WelcomeScreen.vue";
import ConversationHistory from "@/components/specs/ConversationHistory.vue";
import LoadingIndicator from "@/components/specs/LoadingIndicator.vue";
import MessageInput from "@/components/specs/MessageInput.vue";

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

const isLoading = ref(false);
const showScrollButton = ref(false);

const sendSpecsRequest = async (queryText) => {
  if (!queryText.trim()) return;

  const updatedHistory = [
    ...props.conversationHistory,
    {
      type: "user",
      content: queryText,
    },
  ];

  emit("update:conversationHistory", updatedHistory);

  if (props.isFirstMessage) {
    emit("update:isFirstMessage", false);
  }

  isLoading.value = true;

  const responseObj = {
    type: "response",
    content: {
      query: queryText,
      specifications: "",
      sources: [],
    },
    isStreaming: true,
  };

  const historyWithResponse = [...updatedHistory, responseObj];
  emit("update:conversationHistory", historyWithResponse);

  try {
    const response = await fetch("http://0.0.0.0:8080/specs/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: queryText,
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
            responseObj.content.query = chunkData.query;
            responseObj.content.specifications = chunkData.specifications;
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
        responseObj.content.query = chunkData.query;
        responseObj.content.specifications = chunkData.specifications;
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
    console.error("Error sending request:", error);
    emit("update:conversationHistory", [
      ...updatedHistory,
      {
        type: "error",
        content: "Sorry, there was an error processing your request.",
      },
    ]);
  } finally {
    isLoading.value = false;
  }
};

const handleExampleQuery = (query) => {
  sendSpecsRequest(query);
};

const handleRetry = (query) => {
  const updatedHistory = props.conversationHistory.filter(item => 
    !(item.type === 'response' && item.content.query === query));
  
  emit("update:conversationHistory", updatedHistory);
  
  sendSpecsRequest(query);
};

defineExpose({
  resetChat: () => {
    isLoading.value = false;
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
  <WelcomeScreen v-if="isFirstMessage" @example-query="handleExampleQuery" />

  <ConversationHistory v-else :conversationHistory="conversationHistory" @retry="handleRetry" />

  <div class="mt-auto mb-2 px-4">
    <LoadingIndicator :isLoading="isLoading" />
    <MessageInput @send-message="sendSpecsRequest" />
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
