<script setup lang="ts">
import { useHomeHero } from '../composables/useHomeSection'
import HomeBrandStory from './HomeBrandStory.vue'
import HomeCategories from './HomeCategories.vue'
import HomeCollections from './HomeCollections.vue'
import HomeHero from './HomeHero.vue'
import HomeNewArrivals from './HomeNewArrivals.vue'
import HomeNewsletter from './HomeNewsletter.vue'

const hero = await useHomeHero()
</script>

<template>
  <div>
    <HomeHero
      v-if="hero"
      :content="hero"
    />
    <HomeCategories />
    <HomeNewArrivals />
    <HomeCollections />
    <HomeBrandStory />
    <HomeNewsletter />
  </div>
</template>
