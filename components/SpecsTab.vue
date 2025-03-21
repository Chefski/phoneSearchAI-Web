<script setup>
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ref } from "vue";
import { Motion } from "motion-v";

const query = ref("");
const conversationHistory = ref([]);
const isFirstMessage = ref(true);

const loadingMessages = [
  "🔍 Searching for sources",
  "📱 Analyzing sources",
  "🤖 Processing your request...",
  "📊 Gathering detailed information...",
  "🔄 Comparing data sources...",
];

// State for loading animation
const isLoading = ref(false);
const currentMessageIndex = ref(0);

// Interval for message rotation
let messageInterval;

// Function to start loading animation
const startLoading = () => {
  isLoading.value = true;
  currentMessageIndex.value = 0;
  messageInterval = setInterval(() => {
    currentMessageIndex.value =
      (currentMessageIndex.value + 1) % loadingMessages.length;
  }, 4000);
};

// Function to stop loading animation
const stopLoading = () => {
  isLoading.value = false;
  clearInterval(messageInterval);
};

// Update sendSpecsRequest function
const sendSpecsRequest = async () => {
  if (!query.value.trim()) return;

  const currentQuery = query.value;
  conversationHistory.value.push({
    type: "user",
    content: currentQuery,
  });

  query.value = "";
  if (isFirstMessage.value) {
    isFirstMessage.value = false;
  }

  startLoading();

  try {
    const response = await fetch("http://0.0.0.0:8080/specs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: currentQuery,
      }),
    });

    const data = await response.json();
    // console.log("API Response:", data);
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
    stopLoading();
  }
};
</script>

<template>
  <!-- Welcome screen shown only when no messages -->
  <div
    v-if="isFirstMessage"
    class="flex flex-col items-center text-center gap-4"
  >
    <Icon name="meteor-icons:robot" class="h-16 w-16" />
    <div>
      <p class="text-lg font-semibold">Welcome to PhoneSearch AI</p>
      <p class="text-gray-500">
        Ask me about any phone model to get detailed specifications.
      </p>
    </div>
    <div class="flex flex-row gap-4 mt-2">
      <Button
        variant="outline"
        @click="
          query = 'Samsung S25';
          sendSpecsRequest();
        "
        >Samsung S25</Button
      >
      <Button
        variant="outline"
        @click="
          query = 'Xiaomi Redmi 15';
          sendSpecsRequest();
        "
        >iPhone 16</Button
      >
      <Button
        variant="outline"
        @click="
          query = 'Samsung S25';
          sendSpecsRequest();
        "
        >Google Pixel 9</Button
      >
    </div>
  </div>

  <!-- Conversation history display after first message -->
  <div v-else class="flex-1 overflow-y-auto mb-4">
    <div class="space-y-6 px-4">
      <template v-for="(item, index) in conversationHistory" :key="index">
        <!-- User query -->
        <div
          v-if="item.type === 'user'"
          class="p-2.5 rounded-lg max-w-[30%] bg-primary text-primary-foreground ml-auto"
        >
          <p class="text-sm">{{ item.content }}</p>
        </div>

        <!-- API Response -->
        <div
          v-else-if="item.type === 'response'"
          class="bg-card border rounded-lg p-4 shadow-sm"
        >
          <h2 class="text-lg font-semibold mb-2">{{ item.content.query }}</h2>

          <!-- Markdown formatting -->
          <div class="prose prose-sm max-w-none text-sm">
            <div
              v-html="
                item.content.specifications
                  .replace(
                    /\*\*(.*?)\*\*/g,
                    '<h3 class=\'text-md font-semibold mt-3 mb-1\'>$1</h3>'
                  )
                  .replace(
                    /\* (.*?)(?=\n|$)/g,
                    '<h4 class=\'text-sm font-medium mt-2 mb-0.5\'>$1</h4>'
                  )
                  .replace(
                    /\+ (.*?)(?=\n|$)/g,
                    '<li class=\'ml-4 list-disc my-0.5\'>$1</li>'
                  )
                  .replace(/\n/g, '')
              "
            ></div>
          </div>

          <div class="mt-4 pt-3 border-t border-border">
            <Accordion type="single" collapsible>
              <AccordionItem value="sources">
                <AccordionTrigger
                  class="text-xs font-medium text-muted-foreground"
                >
                  <div class="flex items-center gap-2 flex-1">
                    Sources
                    <div class="flex -space-x-2 ml-2">
                      <template
                        v-for="(source, idx) in item.content.sources.slice(
                          0,
                          3
                        )"
                        :key="idx"
                      >
                        <img
                          :src="`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                            source.replace(/^https?:\/\//, '').split('/')[0]
                          )}&sz=16`"
                          :alt="source"
                          class="w-4 h-4 min-w-[16px] rounded-full border border-gray-200 border-background"
                          loading="lazy"
                          @error="$event.target.style.display = 'none'"
                        />
                      </template>
                      <span
                        v-if="item.content.sources.length > 3"
                        class="w-4 h-4 flex items-center justify-center text-[10px] bg-muted rounded-full border border-background"
                      >
                        +{{ item.content.sources.length - 3 }}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul class="text-xs text-muted-foreground space-y-1">
                    <li
                      v-for="(source, sourceIndex) in item.content.sources"
                      :key="sourceIndex"
                      class="flex items-center gap-2"
                    >
                      <img
                        :src="`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                          source.replace(/^https?:\/\//, '').split('/')[0]
                        )}&sz=16`"
                        :alt="source"
                        class="w-4 h-4 min-w-[16px]"
                        loading="lazy"
                        @error="$event.target.style.display = 'none'"
                      />
                      <a
                        :href="source"
                        target="_blank"
                        class="text-primary hover:underline truncate block flex-1"
                      >
                        {{ source }}
                      </a>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <div
          v-else-if="item.type === 'error'"
          class="p-2.5 rounded-lg max-w-[70%] bg-destructive text-destructive-foreground"
        >
          <p class="text-sm">{{ item.content }}</p>
        </div>
      </template>
    </div>
  </div>

  <!-- Input area always shown -->
  <div class="mt-auto mb-2 px-4">
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
    <div class="flex flex-row gap-2">
      <Input
        v-model="query"
        type="text"
        placeholder="Message PhoneSearchAI"
        @keyup.enter="sendSpecsRequest"
      />
      <Button variant="default" @click="sendSpecsRequest">Send</Button>
    </div>
  </div>
</template>
