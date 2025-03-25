<script setup>
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ref, defineProps, defineEmits } from "vue";
import { useFocusToggle } from "@/composables/useFocusToggle";

const props = defineProps({
  accordionOpen: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:accordionOpen']);

const { focusOptions, toggleFocus, getActiveFocus } = useFocusToggle();
</script>

<template>
  <div class="mb-4 mx-4">
    <Accordion
      type="single"
      collapsible
      class="w-full"
      :value="accordionOpen"
      @update:value="emit('update:accordionOpen', $event)"
    >
      <AccordionItem value="focus" class="border rounded-md shadow-sm">
        <AccordionTrigger class="px-4 py-2">
          <span class="text-sm font-medium">Focus on: {{ getActiveFocus() }}</span>
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

            <!-- Other focus options -->
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
</template>