<script setup>
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

defineProps({
  conversationHistory: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['retry']);
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <div class="space-y-6 px-4 mb-6">
      <template v-for="(item, index) in conversationHistory" :key="index">
        <!-- User query -->
        <div v-if="item.type === 'user'" class="flex justify-end w-full">
          <div
            class="p-2.5 rounded-lg inline-block max-w-[80%] bg-primary text-primary-foreground"
          >
            <p class="text-sm">{{ item.content }}</p>
          </div>
        </div>

        <!-- API Response -->
        <!-- shadow-[0_10px_15px_-3px_rgba(0,0,0,0.25),_inset_0_4px_8px_0px_rgba(0,0,0,0.15)] -->
        <div
          v-else-if="item.type === 'response'"
          class="bg-card border rounded-lg p-4 shadow-lg"
        >
          <h2 class="text-lg font-semibold mb-2">{{ item.content.query }}</h2>

          <div v-if="item.isStreaming" class="flex items-center gap-2 mb-2">
            <div class="relative w-4 h-4">
              <div
                class="absolute inset-0 rounded-full bg-primary opacity-25 animate-ping"
              ></div>
              <div class="absolute inset-0 rounded-full bg-primary"></div>
            </div>
            <span class="text-xs font-medium text-muted-foreground"
              >Generating response...</span
            >
          </div>

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

          <div
            v-if="
              item.content.sources &&
              item.content.sources.length > 0 &&
              !item.isStreaming
            "
            class="mt-4 pt-3 border-t"
          >
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
          <button
            v-if="!item.isStreaming"
            @click="emit('retry', item.content.query)"
            class="mt-4 p-2 hover:bg-muted rounded-md transition-colors flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            title="Retry query"
          >
            <Icon name="tabler:repeat" class="w-5 h-5" />
            Retry
          </button>
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
</template>
