<script setup lang="ts">
type FooterLink = {
  labelKey: string
  href: string
  external?: boolean
}

type SocialLink = FooterLink & {
  iconName: string
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
    { labelKey: 'footer.customerCare.links.contact', href: 'mailto:hello@uandiplus.com' },
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
  { labelKey: 'footer.information.links.stores', href: '/content/stores' },
  { labelKey: 'footer.information.links.careers', href: '/content/careers' },
  { labelKey: 'footer.information.links.ambassadors', href: '/content/ambassador' },
  { labelKey: 'footer.information.links.affiliate', href: '/content/affiliate' },
  { labelKey: 'footer.information.links.press', href: '/content/press' },
] satisfies FooterLink[]

const publicConfig = runtimeConfig.public as Record<string, unknown>

function configString(key: string): string {
  const value = publicConfig[key]
  return typeof value === 'string' ? value.trim() : ''
}

const socialLinks = computed<SocialLink[]>(() => {
  const candidates: SocialLink[] = [
    { labelKey: 'footer.social.links.tiktok', href: configString('socialTiktokUrl'), iconName: 'icon:tiktok' },
    { labelKey: 'footer.social.links.youtube', href: configString('socialYoutubeUrl'), iconName: 'icon:youtube' },
    { labelKey: 'footer.social.links.instagram', href: configString('socialInstagramUrl'), iconName: 'icon:instagram' },
    { labelKey: 'footer.social.links.facebook', href: configString('socialFacebookUrl'), iconName: 'icon:facebook' },
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
    <h2
      id="footer-heading"
      class="sr-only"
    >
      {{ $t('footer.heading') }}
    </h2>

    <section class="bg-[#f7f7f7] py-8">
      <div class="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 px-4 text-center sm:px-8 md:grid-cols-2 lg:grid-cols-3">
        <div class="mx-auto w-full max-w-[360px]">
          <h3 class="mb-1 text-[14px] font-semibold uppercase leading-tight tracking-[0.083em]">
            {{ $t('footer.newsletter.title') }}
          </h3>
          <p class="mx-auto mb-3 text-[14px] leading-[1.55] text-black">
            {{ $t('footer.newsletter.copyBefore') }}
            <strong>{{ $t('footer.newsletter.discount') }}</strong>
            {{ $t('footer.newsletter.copyAfter') }}
            <NuxtLink
              :to="localePath('/content/privacy')"
              class="font-semibold underline"
            >
              {{ $t('footer.newsletter.privacy') }}
            </NuxtLink>
          </p>

          <form
            class="flex items-stretch"
            novalidate
            @submit.prevent="submitNewsletter"
          >
            <label
              class="sr-only"
              for="uandiplus-subscribe"
            >
              {{ $t('footer.newsletter.emailLabel') }}
            </label>
            <input
              id="uandiplus-subscribe"
              v-model="newsletterEmail"
              class="min-h-11 flex-1 border border-r-0 border-black bg-transparent px-3 py-2 text-[13px] leading-none text-black placeholder:text-[#666]"
              type="email"
              name="email"
              autocomplete="email"
              inputmode="email"
              :placeholder="$t('footer.newsletter.placeholder')"
              :disabled="newsletterPending"
              :aria-invalid="newsletterStatus === 'invalid'"
              :aria-describedby="newsletterMessage ? 'footer-newsletter-message' : undefined"
            >
            <button
              class="flex min-h-11 min-w-11 items-center justify-center border border-black bg-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              :disabled="newsletterPending"
              :aria-label="$t('footer.newsletter.submit')"
            >
              <Icon
                v-if="!newsletterPending"
                name="icon:arrow-right"
                class="size-4"
              />
              <span
                v-else
                class="text-[11px] font-semibold uppercase"
              >
                …
              </span>
            </button>
          </form>

          <p
            v-if="newsletterMessage"
            id="footer-newsletter-message"
            class="mt-2 text-left text-[12px] leading-snug"
            :class="newsletterStatus === 'success' ? 'text-green-700' : 'text-[#b20000]'"
            role="status"
          >
            {{ newsletterMessage }}
          </p>
        </div>

        <div
          v-if="hasAppDownload"
          class="mx-auto w-full max-w-[360px]"
        >
          <h3 class="mb-1 text-[14px] font-semibold uppercase leading-tight tracking-[0.083em]">
            {{ $t('footer.app.title') }}
          </h3>
          <p class="mb-3 text-[14px] leading-[1.55]">
            {{ $t('footer.app.copy') }}
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <a
              v-if="appStoreUrl"
              class="inline-flex min-h-11 items-center text-black"
              :href="appStoreUrl"
              target="_blank"
              rel="noreferrer noopener"
              :aria-label="$t('footer.app.download')"
            >
              <Icon
                name="icon:apple"
                class="h-10 w-[120px]"
              />
            </a>
            <a
              v-if="playStoreUrl"
              class="inline-flex min-h-11 items-center rounded border border-black px-3 py-2 text-[12px] font-semibold uppercase"
              :href="playStoreUrl"
              target="_blank"
              rel="noreferrer noopener"
            >
              {{ $t('footer.app.playStore') }}
            </a>
          </div>
        </div>
      </div>
    </section>

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
                  <Icon
                    :name="link.iconName"
                    class="size-4"
                  />
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
            <img
              class="block h-auto w-full"
              src="https://is4.revolveassets.com/images/up/2025/July/070925_RW_FWRD_CrossPromoFooter_B_r.png"
              srcset="https://is4.revolveassets.com/images/up/2025/July/070925_RW_FWRD_CrossPromoFooter_B_r.png 1x, https://is4.revolveassets.com/images/up/2025/July/070925_RW_FWRD_CrossPromoFooter_B_r.png 2x"
              :alt="$t('footer.promo.alt')"
              loading="lazy"
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
                <Icon
                  name="icon:verification"
                  class="h-[14px] w-[30px]"
                />
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  </footer>
</template>
