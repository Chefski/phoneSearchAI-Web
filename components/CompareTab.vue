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

const { toast } = useToast();

const phonesToCompare = ref([
  { id: 1, name: "" },
  { id: 2, name: "" },
]);

const isLoading = ref(false);
const conversationHistory = ref([]);
const isFirstMessage = ref(true);
const currentMessageIndex = ref(0);

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

import { useFocusToggle } from '@/composables/useFocusToggle'

const focusAccordionOpen = ref(null);

const { focusOptions, toggleFocus, getActiveFocus } = useFocusToggle()

const sendCompareRequest = async () => {
  const validPhones = phonesToCompare.value
    .filter((phone) => phone.name.trim() !== "")
    .map((phone) => phone.name.trim());

  // Ensure we have at least 2 phones to compare
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
  <!-- Welcome screen shown only when no messages -->
  <div
    v-if="isFirstMessage"
    class="flex flex-col items-center text-center gap-4"
  >
    <Icon name="meteor-icons:robot" class="h-16 w-16" />
    <p class="text-lg font-semibold">Welcome to PhoneSearch AI</p>
    <p class="text-gray-500">
      Ask me to compare two or more phone models to see how they stack up.
    </p>
    <div class="flex flex-row gap-4 mt-2">
      <Button
        variant="outline"
        @click="quickCompare(['Samsung S25', 'iPhone 16'])"
      >
        Samsung S25 vs iPhone 16
      </Button>
      <Button
        variant="outline"
        @click="quickCompare(['Samsung Fold 3', 'Samsung Flip 3'])"
      >
        Samsung Fold 3 vs Samsung Flip 3
      </Button>
    </div>
  </div>

  <!-- Conversation history display after first message -->
  <div v-else class="flex-1 overflow-y-auto mb-4">
    <div class="space-y-6 px-4">
      <template v-for="(item, index) in conversationHistory" :key="index">
        <!-- User query -->
        <div
          v-if="item.type === 'user'"
          class="p-2.5 rounded-lg max-w-[70%] bg-primary text-primary-foreground ml-auto"
        >
          <p class="text-sm">{{ item.content }}</p>
        </div>

        <!-- API Response -->
        <div v-else-if="item.type === 'response'" class="bg-card rounded-lg">
          <h2 class="text-lg font-semibold mb-2">
            {{ item.content.phones.join(" vs ") }}
            <span class="text-sm font-normal text-muted-foreground">
              (Focus: {{ item.content.focus }})
            </span>
          </h2>

          <!-- Markdown formatting -->
          <div class="prose prose-sm max-w-none text-sm">
            <div
              v-html="
                item.content.comparison
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
                  .replace(/\n\n/g, '<br/>')
                  .replace(/\n/g, '')
              "
            ></div>
          </div>
          <div class="mt-1 pt-3 border-border">
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

  <div class="mt-auto mb-2">
    <div class="h-6 overflow-hidden relative px-4">
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

    <div class="mb-4 mx-4">
      <Accordion
        type="single"
        collapsible
        class="w-full"
        v-model:value="focusAccordionOpen"
      >
        <AccordionItem value="focus" class="border rounded-md shadow-sm">
          <AccordionTrigger class="px-4 py-2">
            <span class="text-sm font-medium"
              >Focus on: {{ getActiveFocus() }}</span
            >
          </AccordionTrigger>
          <AccordionContent class="px-4 pb-4">
            <div class="flex flex-wrap gap-4">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-2">
                  <Icon name="material-symbols:all-inclusive" class="w-4 h-4" />
                  <span class="font-mono font-bold">Everything</span>
                </div>
                <Switch
                  id="switch-everything"
                  v-model="focusOptions.everything"
                  @update:modelValue="toggleFocus('everything')"
                />
              </div>

              <div class="flex items-center gap-2">
                <div class="flex items-center gap-2">
                  <Icon
                    name="material-symbols:camera-outline-rounded"
                    class="w-4 h-4"
                  />
                  <span class="font-mono font-bold">Camera</span>
                </div>
                <Switch
                  id="switch-camera"
                  v-model="focusOptions.camera"
                  @update:modelValue="toggleFocus('camera')"
                />
              </div>

              <div class="flex items-center gap-2">
                <div class="flex items-center gap-2">
                  <Icon name="icon-park-solid:game-two" class="w-4 h-4" />
                  <span class="font-mono font-bold">Gaming</span>
                </div>
                <Switch
                  id="switch-gaming"
                  v-model="focusOptions.gaming"
                  @update:modelValue="toggleFocus('gaming')"
                />
              </div>

              <div class="flex items-center gap-2">
                <div class="flex items-center gap-2">
                  <Icon
                    name="mingcute:display-line"
                    class="h-4 w-4"
                    style="transform: rotate(90deg) scaleY(-1)"
                  />
                  <span class="font-mono font-bold">Display</span>
                </div>
                <Switch
                  id="switch-display"
                  v-model="focusOptions.display"
                  @update:modelValue="toggleFocus('display')"
                />
              </div>

              <div class="flex items-center gap-2">
                <div class="flex items-center gap-2">
                  <Icon name="mdi:battery" class="h-4 w-4" />
                  <span class="font-mono font-bold">Battery</span>
                </div>
                <Switch
                  id="switch-battery"
                  v-model="focusOptions.battery"
                  @update:modelValue="toggleFocus('battery')"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>

    <div class="grid grid-cols-4 gap-4 px-4">
      <div class="col-span-3 grid grid-cols-3 gap-4">
        <template v-for="phone in phonesToCompare" :key="phone.id">
          <div class="relative group">
            <Input
              v-model="phone.name"
              type="text"
              :placeholder="`Phone ${phone.id}`"
              class="pr-10"
            />
            <Button
              v-if="phonesToCompare.length > 2"
              variant="ghost"
              size="icon"
              class="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              @click="removePhone(phone.id)"
            >
              <Icon name="material-symbols:delete-outline" class="h-4 w-4" />
            </Button>
          </div>
        </template>
        <Button
          v-if="phonesToCompare.length < 6"
          variant="outline"
          class="w-full"
          @click="addPhoneInput"
        >
          <Icon name="material-symbols:add" class="h-4 w-4 mr-1.5" />
          Add Phone
        </Button>
      </div>
      <div class="col-span-1 flex items-start">
        <Button
          variant="default"
          size="lg"
          @click="sendCompareRequest"
          :disabled="isLoading"
          class="w-full h-full min-h-[40px]"
        >
          <Icon name="material-symbols:compare-arrows" class="h-5 w-5 mr-2" />
          Compare Phones
        </Button>
      </div>
    </div>
  </div>
</template>
