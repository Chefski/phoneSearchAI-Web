<script setup>
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ref } from "vue";

const phonesToCompare = ref([
  { id: 1, name: "" },
  { id: 2, name: "" },
]);

const addPhoneInput = () => {
  const newId = phonesToCompare.value.length + 1;
  phonesToCompare.value.push({ id: newId, name: "" });
};

const removePhone = (id) => {
  phonesToCompare.value = phonesToCompare.value.filter(
    (phone) => phone.id !== id
  );
};
</script>

<template>
  <div class="flex flex-col items-center text-center gap-4">
    <Icon name="meteor-icons:robot" class="h-16 w-16" />
    <p class="text-lg font-semibold">Welcome to PhoneSearch AI</p>
    <p class="text-gray-500">
      Ask me to compare two or more phone models to see how they stack up.
    </p>
    <div class="flex flex-row gap-4 mt-2">
      <Button variant="outline">Samsung S25 vs iPhone 16</Button>
      <Button variant="outline">Samsung Fold 3 vs Samsung Flip 3</Button>
    </div>
  </div>
  <div class="mt-auto mb-10">
    <div class="flex justify-center mb-4">
      <Button variant="default" size="lg">
        <Icon name="material-symbols:compare-arrows" class="h-5 w-5 mr-2" />
        Compare Phones
      </Button>
    </div>
    <div class="grid grid-cols-3 gap-4">
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
      <Button variant="outline" class="w-full" @click="addPhoneInput">
        <Icon name="material-symbols:add" class="h-4 w-4 mr-1.5" />
        Add Phone
      </Button>
    </div>
  </div>
</template>
