<script setup>
import { NuxtLink } from "#components";
</script>

<template>
  <header
    class="border-b border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="container max-w-4xl mx-auto flex h-14 items-center px-4">
      <NuxtLink to="/" class="flex items-center gap-0">
        <Icon
          name="material-symbols:smartphone"
          size="24"
          style="color: black"
        />
        <span class="font-bold text-lg">PhoneSearch AI</span>
      </NuxtLink>
    </div>
  </header>
</template>
