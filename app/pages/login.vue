<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
definePageMeta({
  layout: 'blank',
})
const redirectTarget = computed(() => {
  const redirect = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect

  return typeof redirect === 'string' && redirect ? redirect : '/'
})

const registerHref = computed(() => {
  return redirectTarget.value !== '/'
    ? `/register?redirect=${encodeURIComponent(redirectTarget.value)}`
    : '/register'
})

useSeoMeta({
  title: () => t('auth.login.seo.title'),
  description: () => t('auth.login.seo.description'),
})
</script>

<template>
  <AuthPage
    :title="$t('auth.login.title')"
    :prompt-text="$t('auth.login.promptText')"
    :prompt-link-label="$t('auth.login.promptLinkLabel')"
    :prompt-link-to="registerHref"
    :google-label="$t('auth.login.googleLabel')"
    :submit-label="$t('auth.login.submitLabel')"
    auth-action="login"
    :success-redirect-to="redirectTarget"
  />
</template>
