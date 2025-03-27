<script setup>
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ref, defineProps, defineEmits, watch } from "vue";
import { useFocusToggle } from "@/composables/useFocusToggle";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";

const props = defineProps({
  accordionOpen: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:accordionOpen", "update:sourcesCount"]);

const { focusOptions, toggleFocus, getActiveFocus } = useFocusToggle();
const sourcesCount = ref(3);

watch(sourcesCount, (newValue) => {
  emit("update:sourcesCount", newValue);
});
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
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-1">
              <Icon
                name="material-symbols:center-focus-weak-rounded"
                class="w-5 h-5"
              />
              <span class="text-sm font-medium">
                Focus on: {{ getActiveFocus() }}
              </span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon name="rivet-icons:globe" class="w-4 h-4" />
              <span class="text-sm font-medium">
                Sources: {{ sourcesCount }}
              </span>
            </div>
          </div>
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

            <div class="flex items-center gap-2 mt-1">
              <div class="flex items-center gap-2">
                <Icon name="rivet-icons:globe" class="h-4 w-4" />
                <span class="font-mono font-bold">Sources</span>
              </div>
              <NumberField
                id="sources"
                v-model="sourcesCount"
                :default-value="4"
                :min="2"
                :max="6"
                class="w-24"
              >
                <NumberFieldContent>
                  <NumberFieldDecrement />
                  <NumberFieldInput />
                  <NumberFieldIncrement />
                </NumberFieldContent>
              </NumberField>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</template>
