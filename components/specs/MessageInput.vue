<script setup>
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ref } from "vue";

const query = ref("");
const emit = defineEmits(['send-message']);

const sendMessage = () => {
  if (!query.value.trim()) return;
  emit('send-message', query.value);
  query.value = "";
};
</script>

<template>
  <div class="flex flex-row gap-2">
    <Input
      v-model="query"
      type="text"
      placeholder="Message PhoneSearchAI"
      @keyup.enter="sendMessage"
    />
    <Button variant="default" @click="sendMessage">Send</Button>
  </div>
</template>