<script setup>
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps({
  phones: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:phones", "compare"]);

const addPhoneInput = () => {
  if (props.phones.length >= 6) return;
  const newId = props.phones.length + 1;
  const updatedPhones = [...props.phones, { id: newId, name: "" }];
  emit("update:phones", updatedPhones);
};

const removePhone = (id) => {
  const updatedPhones = props.phones.filter((phone) => phone.id !== id);
  emit("update:phones", updatedPhones);
};
</script>

<template>
  <div class="grid grid-cols-4 gap-4 px-4">
    <div class="col-span-3 grid grid-cols-3 gap-4">
      <template v-for="phone in phones" :key="phone.id">
        <div class="relative group">
          <Input
            v-model="phone.name"
            type="text"
            :placeholder="`Phone ${phone.id}`"
            class="pr-10"
            @input="emit('update:phones', phones)"
          />
          <Button
            v-if="phones.length > 2"
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
        v-if="phones.length < 6"
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
        @click="emit('compare')"
        :disabled="false"
        class="w-full h-full"
      >
        <Icon name="material-symbols:compare-arrows" class="h-5 w-5 mr-2" />
        Compare Phones
      </Button>
    </div>
  </div>
</template>
