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

const activeTab = ref("specs");
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
            <Button variant="outline" class="text-sm"
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
          <SpecsTab v-if="activeTab === 'specs'" />
          <CompareTab v-else />
        </div>
      </div>
    </main>
  </div>
</template>
