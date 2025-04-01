<script setup>
import Header from "./components/Header.vue";
import SpecsTab from "./components/SpecsTab.vue";
import CompareTab from "./components/CompareTab.vue";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toast";
import { ref } from "vue";

useHead({
  title: "PhoneSearchAI",
});

// Default tab
const activeTab = ref("specs");

const specsTabRef = ref(null);
const compareTabRef = ref(null);

const specsConversationHistory = ref([]);
const specsIsFirstMessage = ref(true);
const compareConversationHistory = ref([]);
const compareIsFirstMessage = ref(true);

const resetChat = () => {
  if (activeTab.value === "specs" && specsTabRef.value) {
    specsTabRef.value.resetChat();
    specsConversationHistory.value = [];
    specsIsFirstMessage.value = true;
  } else if (activeTab.value === "compare" && compareTabRef.value) {
    compareTabRef.value.resetChat();
    compareConversationHistory.value = [];
    compareIsFirstMessage.value = true;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <Toaster />
    <main class="container max-w-screen-lg mx-auto pb-10 flex-1 flex flex-col">
      <div class="border border-gray-200 mt-10 rounded-lg flex-1 flex flex-col">
        <div class="p-4 flex flex-row items-center justify-between">
          <div class="text-left font-sm">
            <h3 class="text-md font-semibold">Phone finder</h3>
            <h4 class="text-sm text-gray-500">
              Ask about phone specs or compare multiple models
            </h4>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" class="text-sm" @click="resetChat"
              ><Icon name="tabler:plus"></Icon> New Chat</Button
            >
            <Tabs v-model="activeTab">
              <TabsList class="justify-center">
                <TabsTrigger value="specs" class="flex items-center">
                  <Icon
                    name="majesticons:checkbox-list-detail"
                    class="h-4 w-4 mr-1.5"
                  />
                  Specs
                </TabsTrigger>
                <TabsTrigger value="compare" class="flex items-center">
                  <Icon
                    name="material-symbols:compare-arrows-rounded"
                    class="h-4 w-4 mr-1.5"
                  />
                  Compare
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 flex-1 flex flex-col">
          <SpecsTab
            v-if="activeTab === 'specs'"
            ref="specsTabRef"
            :conversation-history="specsConversationHistory"
            :is-first-message="specsIsFirstMessage"
            @update:conversation-history="specsConversationHistory = $event"
            @update:is-first-message="specsIsFirstMessage = $event"
          />
          <CompareTab
            v-else
            ref="compareTabRef"
            :conversation-history="compareConversationHistory"
            :is-first-message="compareIsFirstMessage"
            @update:conversation-history="compareConversationHistory = $event"
            @update:is-first-message="compareIsFirstMessage = $event"
          />
        </div>
      </div>
    </main>
  </div>
</template>
