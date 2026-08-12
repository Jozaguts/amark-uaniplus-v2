<script setup lang="ts">
type FooterLink = {
  labelKey: string
  href: string
  external?: boolean
}

type SocialLink = FooterLink & {
  icon: 'tiktok' | 'youtube' | 'instagram' | 'facebook'
}

const localePath = useLocalePath()
const storefront = useStorefront()
const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()

const newsletterEmail = shallowRef('')
const newsletterPending = shallowRef(false)
const newsletterStatus = shallowRef<'idle' | 'success' | 'error' | 'invalid'>('idle')

const customerCareColumns = [
  [
    { labelKey: 'footer.customerCare.links.contact', href: 'mailto:hello@trendfied.com' },
    { labelKey: 'footer.customerCare.links.phone', href: 'tel:+18008720441' },
    { labelKey: 'footer.customerCare.links.trackOrder', href: '/account/orders' },
  ],
  [
    { labelKey: 'footer.customerCare.links.shipping', href: '/content/shipping' },
    { labelKey: 'footer.customerCare.links.returns', href: '/content/returns' },
    { labelKey: 'footer.customerCare.links.sizeGuide', href: '/content/size-guide' },
  ],
  [
    { labelKey: 'footer.customerCare.links.faqs', href: '/content/faqs' },
    { labelKey: 'footer.customerCare.links.payment', href: '/content/payment' },
    { labelKey: 'footer.customerCare.links.accessibility', href: '/content/accessibility' },
  ],
] satisfies FooterLink[][]

const informationLinks = [
  { labelKey: 'footer.information.links.about', href: '/content/about' },
  // { labelKey: 'footer.information.links.stores', href: '/content/stores' },
  // { labelKey: 'footer.information.links.careers', href: '/content/careers' },
  // { labelKey: 'footer.information.links.ambassadors', href: '/content/ambassador' },
  // { labelKey: 'footer.information.links.affiliate', href: '/content/affiliate' },
  // { labelKey: 'footer.information.links.press', href: '/content/press' },
] satisfies FooterLink[]

const publicConfig = runtimeConfig.public as Record<string, unknown>

function configString(key: string): string {
  const value = publicConfig[key]
  return typeof value === 'string' ? value.trim() : ''
}

const socialLinks = computed<SocialLink[]>(() => {
  const candidates: SocialLink[] = [
    { labelKey: 'footer.social.links.tiktok', href: configString('socialTiktokUrl'), icon: 'tiktok' },
    { labelKey: 'footer.social.links.youtube', href: configString('socialYoutubeUrl'), icon: 'youtube' },
    { labelKey: 'footer.social.links.instagram', href: configString('socialInstagramUrl'), icon: 'instagram' },
    { labelKey: 'footer.social.links.facebook', href: configString('socialFacebookUrl'), icon: 'facebook' },
  ]

  return candidates.filter(link => isActionableHref(link.href))
})

const appStoreUrl = computed(() => configString('appStoreUrl'))
const playStoreUrl = computed(() => configString('playStoreUrl'))
const hasAppDownload = computed(() => Boolean(appStoreUrl.value || playStoreUrl.value))

const legalLinks = [
  { labelKey: 'footer.legal.terms', href: '/content/terms' },
  { labelKey: 'footer.legal.privacy', href: '/content/privacy' },
  { labelKey: 'footer.legal.caPrivacy', href: '/content/privacy#privacy-ca-residents' },
  { labelKey: 'footer.legal.caTransparency', href: '/content/supply-chain' },
] satisfies FooterLink[]

function isActionableHref(href: string | null | undefined): boolean {
  if (!href)
    return false

  const normalized = href.trim()
  return normalized.length > 0 && normalized !== '#'
}

function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href)
}

function footerLinkTarget(href: string): string {
  if (isExternalHref(href))
    return href

  return localePath(href)
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

async function submitNewsletter(): Promise<void> {
  const email = newsletterEmail.value.trim()

  if (!isValidEmail(email)) {
    newsletterStatus.value = 'invalid'
    return
  }

  newsletterPending.value = true
  newsletterStatus.value = 'idle'

  try {
    await storefront('/newsletter/subscribe', {
      method: 'POST',
      body: { email },
    })
    newsletterStatus.value = 'success'
    newsletterEmail.value = ''
  }
  catch {
    newsletterStatus.value = 'error'
  }
  finally {
    newsletterPending.value = false
  }
}

const newsletterMessage = computed(() => {
  switch (newsletterStatus.value) {
    case 'success':
      return t('footer.newsletter.success')
    case 'error':
      return t('footer.newsletter.error')
    case 'invalid':
      return t('footer.newsletter.invalidEmail')
    default:
      return ''
  }
})
</script>

<template>
  <footer
    class="mt-16 bg-black text-black sm:mt-[144px]"
    aria-labelledby="footer-heading"
    role="contentinfo"
  >
    <section class="bg-black pt-8 text-white">
      <div class="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 px-4 sm:px-8 lg:grid-cols-12">
        <div class="lg:col-span-8">
          <div class="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div class="md:col-span-9">
              <h3 class="mb-3 text-[14px] font-semibold uppercase leading-tight tracking-[0.083em]">
                {{ $t('footer.customerCare.title') }}
              </h3>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ul
                  v-for="(column, index) in customerCareColumns"
                  :key="index"
                  class="space-y-1"
                >
                  <li
                    v-for="link in column"
                    :key="link.labelKey"
                  >
                    <a
                      class="inline-flex min-h-10 items-center text-[12px] leading-[1.7] text-[#949494] hover:text-white hover:underline"
                      :href="footerLinkTarget(link.href)"
                    >
                      {{ $t(link.labelKey) }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div class="md:col-span-3">
              <h3 class="mb-3 text-[14px] font-semibold uppercase leading-tight tracking-[0.083em]">
                {{ $t('footer.information.title') }}
              </h3>
              <ul class="space-y-1">
                <li
                  v-for="link in informationLinks"
                  :key="link.labelKey"
                >
                  <NuxtLink
                    class="inline-flex min-h-10 items-center text-[12px] leading-[1.7] text-[#949494] hover:text-white hover:underline"
                    :to="footerLinkTarget(link.href)"
                  >
                    {{ $t(link.labelKey) }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>

          <div
            v-if="socialLinks.length"
            class="mt-8 max-w-[320px] pb-8"
          >
            <h3 class="mb-4 text-[14px] font-semibold uppercase leading-tight tracking-[0.083em]">
              {{ $t('footer.social.title') }}
            </h3>
            <ul class="flex flex-wrap gap-3">
              <li
                v-for="link in socialLinks"
                :key="link.labelKey"
              >
                <a
                  class="flex size-11 items-center justify-center rounded-full bg-white text-black hover:opacity-80"
                  :href="link.href"
                  target="_blank"
                  rel="noreferrer noopener"
                  :aria-label="$t(link.labelKey)"
                >
                  <template v-if="link.icon === 'tiktok'"><svg viewBox="0 0 54.88 64" aria-hidden="true" focusable="false" role="presentation" fill="currentColor" class="size-4 inline-block shrink-0">
    <g id="Layer_1-2" data-name="Layer 1" image-rendering="optimizeQuality" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
        <path d="m39.95,0c1.06,9.08,6.12,14.5,14.94,15.07v10.21c-5.11.5-9.58-1.17-14.78-4.32v19.1c0,24.27-26.46,31.85-37.1,14.46C-3.83,43.34.35,23.69,22.28,22.91v10.77c-1.67.27-3.46.69-5.09,1.25-4.88,1.65-7.64,4.74-6.87,10.2,1.48,10.45,20.64,13.54,19.05-6.87V.02h10.58v-.02Z" style="fill-rule: evenodd;"></path>
    </g>
</svg></template>
                  <template v-else-if="link.icon === 'youtube'"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false" role="presentation" fill="currentColor" class="size-4 inline-block shrink-0">
    <path d="M15.84 4.8a3.461 3.461 0 0 0-.636-1.588 2.288 2.288 0 0 0-1.603-.678l-5.605-.162-5.598.162a2.289 2.289 0 0 0-1.603.678A3.46 3.46 0 0 0 .16 4.801 24.194 24.194 0 0 0 0 7.391v1.214a24.193 24.193 0 0 0 .16 2.59 3.461 3.461 0 0 0 .636 1.588 2.713 2.713 0 0 0 1.764.684c1.28.123 5.44.16 5.44.16l5.6-.167a2.288 2.288 0 0 0 1.603-.678 3.461 3.461 0 0 0 .636-1.588 24.229 24.229 0 0 0 .16-2.59V7.39a24.231 24.231 0 0 0-.16-2.589zm-9.492 5.274L6.347 5.58l4.323 2.256z"></path>
</svg></template>
                  <template v-else-if="link.icon === 'instagram'"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false" role="presentation" fill="currentColor" class="size-4 inline-block shrink-0">
    <path d="M15.952 4.702a5.87 5.87 0 0 0-.372-1.942 3.921 3.921 0 0 0-.923-1.417A3.92 3.92 0 0 0 13.24.42a5.874 5.874 0 0 0-1.942-.372L8 0 4.702.048A5.874 5.874 0 0 0 2.76.42a3.92 3.92 0 0 0-1.417.923A3.921 3.921 0 0 0 .42 2.76a5.87 5.87 0 0 0-.372 1.942L0 8l.048 3.298A5.87 5.87 0 0 0 .42 13.24a3.921 3.921 0 0 0 .923 1.417 3.922 3.922 0 0 0 1.417.923 5.874 5.874 0 0 0 1.942.372L8 16l3.298-.048a5.874 5.874 0 0 0 1.942-.372 4.091 4.091 0 0 0 2.34-2.34 5.87 5.87 0 0 0 .372-1.942L16 8l-.048-3.298zm-1.44 6.53a4.427 4.427 0 0 1-.276 1.486 2.649 2.649 0 0 1-1.518 1.518 4.425 4.425 0 0 1-1.486.275L8 14.56c-2.136 0-2.39-.008-3.233-.047a4.425 4.425 0 0 1-1.486-.275 2.479 2.479 0 0 1-.92-.598 2.48 2.48 0 0 1-.598-.92 4.427 4.427 0 0 1-.276-1.486L1.44 8l.047-3.233a4.426 4.426 0 0 1 .276-1.485 2.479 2.479 0 0 1 .598-.92 2.48 2.48 0 0 1 .92-.598 4.429 4.429 0 0 1 1.486-.275L8 1.44l3.233.047a4.429 4.429 0 0 1 1.486.275 2.479 2.479 0 0 1 .92.598 2.478 2.478 0 0 1 .598.92 4.426 4.426 0 0 1 .276 1.485L14.56 8l-.047 3.233zM8 3.892A4.108 4.108 0 1 0 12.108 8 4.108 4.108 0 0 0 8 3.892zm0 6.775A2.667 2.667 0 1 1 10.667 8 2.667 2.667 0 0 1 8 10.667zm4.27-7.897a.96.96 0 1 0 .96.96.96.96 0 0 0-.96-.96z"></path>
</svg></template>
                  <template v-else-if="link.icon === 'facebook'"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false" role="presentation" fill="currentColor" class="size-4 inline-block shrink-0">
    <path d="M12.69 3.3h-2.68c-.3 0-.67.464-.67 1.03v1.7h3.35v3.352H9.34V16H5.99V9.382H3.31V6.03h2.68V4.382A4.213 4.213 0 0 1 10.011 0h2.68z"></path>
</svg></template>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="lg:col-span-4">
          <NuxtLink
            :to="localePath('/')"
            :aria-label="$t('footer.promo.ctaLabel')"
          >

          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="border-t border-[#3b3b3b] bg-black py-3">
      <div class="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 text-[10px] uppercase text-white sm:px-8 min-[1320px]:flex-row min-[1320px]:items-center min-[1320px]:justify-between">
        <p class="text-[11px] normal-case text-[#949494]">
          {{ $t('footer.legal.copyright') }}
        </p>

        <nav :aria-label="$t('footer.legal.navLabel')">
          <ul class="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-7">
            <li
              v-for="link in legalLinks"
              :key="link.labelKey"
            >
              <NuxtLink
                class="inline-flex min-h-9 items-center hover:underline"
                :to="footerLinkTarget(link.href)"
              >
                {{ $t(link.labelKey) }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                class="inline-flex min-h-9 items-center gap-1 hover:underline"
                :to="localePath('/content/privacy-choices')"
              >
                {{ $t('footer.legal.privacyChoices') }}
                <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 30 14" fill="currentColor" class="h-[14px] w-[30px] inline-block shrink-0">
    <path d="M7.4 12.8h6.8l3.1-11.6H7.4C4.2 1.2 1.6 3.8 1.6 7s2.6 5.8 5.8 5.8z" style="fill-rule:evenodd;clip-rule:evenodd;fill:#fff"></path>
    <path d="M22.6 0H7.4c-3.9 0-7 3.1-7 7s3.1 7 7 7h15.2c3.9 0 7-3.1 7-7s-3.2-7-7-7zm-21 7c0-3.2 2.6-5.8 5.8-5.8h9.9l-3.1 11.6H7.4c-3.2 0-5.8-2.6-5.8-5.8z" style="fill-rule:evenodd;clip-rule:evenodd;fill:#06f"></path>
    <path d="M24.6 4c.2.2.2.6 0 .8L22.5 7l2.2 2.2c.2.2.2.6 0 .8-.2.2-.6.2-.8 0l-2.2-2.2-2.2 2.2c-.2.2-.6.2-.8 0-.2-.2-.2-.6 0-.8L20.8 7l-2.2-2.2c-.2-.2-.2-.6 0-.8.2-.2.6-.2.8 0l2.2 2.2L23.8 4c.2-.2.6-.2.8 0z" style="fill:#fff"></path>
    <path d="M12.7 4.1c.2.2.3.6.1.8L8.6 9.8c-.1.1-.2.2-.3.2-.2.1-.5.1-.7-.1L5.4 7.7c-.2-.2-.2-.6 0-.8.2-.2.6-.2.8 0L8 8.6l3.8-4.5c.2-.2.6-.2.9 0z" style="fill:#06f"></path>
</svg>
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  </footer>
</template>
