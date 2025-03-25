<script setup>
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { defineProps } from "vue";

const props = defineProps({
  conversationHistory: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="flex-1 overflow-y-auto mb-4">
    <div class="space-y-6 px-4">
      <template v-for="(item, index) in conversationHistory" :key="index">
        <!-- User query -->
        <div
          v-if="item.type === 'user'"
          class="flex justify-end w-full"
        >
          <div class="p-2.5 rounded-lg inline-block max-w-[80%] bg-primary text-primary-foreground">
            <p class="text-sm text-right">{{ item.content }}</p>
          </div>
        </div>

        <!-- API Response -->
        <div v-else-if="item.type === 'response'" class="bg-card border rounded-lg p-4 shadow-lg">
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
</template>