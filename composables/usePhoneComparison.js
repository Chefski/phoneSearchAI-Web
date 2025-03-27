import { ref } from "vue";

export function usePhoneComparison() {
  const isLoading = ref(false);
  const currentMessageIndex = ref(0);
  let messageInterval;

  const loadingMessages = [
    "🔍 Searching for sources",
    "📱 Analyzing phone models",
    "🤖 Processing your comparison request...",
    "📊 Gathering detailed information...",
    "🔄 Comparing specifications...",
  ];

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

  const comparePhones = async (phones, focus, sourcesCount, updateCallback) => {
    startLoading();

    try {
      const response = await fetch("http://0.0.0.0:8080/compare/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          focus,
          phones,
          max_sources: sourcesCount,
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
              updateCallback(chunkData, false);
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
          updateCallback(chunkData, true);
        } catch (e) {
          console.error("Error parsing final JSON chunk:", e, buffer);
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending comparison request:", error);
      return { success: false, error };
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading,
    currentMessageIndex,
    loadingMessages,
    comparePhones,
    startLoading,
    stopLoading,
  };
}