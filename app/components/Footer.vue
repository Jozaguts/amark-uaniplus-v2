<script setup lang="ts">
type FooterLink = {
  labelKey: string
  href: string
  external?: boolean
}

type SocialLink = FooterLink & {
  iconName: string
}

const customerCareColumns = [
  [
    { labelKey: 'footer.customerCare.links.contact', href: '/contactus?d=Womens' },
    { labelKey: 'footer.customerCare.links.phone', href: 'tel:018008720441' },
    { labelKey: 'footer.customerCare.links.payment', href: '/payment?d=Womens' },
    { labelKey: 'footer.customerCare.links.faqs', href: '/faqs?d=Womens' },
    { labelKey: 'footer.customerCare.links.trackOrder', href: '/faqs?expanded=orders&d=Womens' },
  ],
  [
    { labelKey: 'footer.customerCare.links.shipping', href: '/shippingdelivery?d=Womens&countryCode=MX' },
    { labelKey: 'footer.customerCare.links.returns', href: '/returnsexchanges?d=Womens' },
    { labelKey: 'footer.customerCare.links.sizeGuide', href: '/sizeguide?d=Womens' },
    { labelKey: 'footer.customerCare.links.gifting', href: '/gifting?d=Womens' },
  ],
  [
    { labelKey: 'footer.customerCare.links.why', href: '/why?d=Womens' },
    { labelKey: 'footer.customerCare.links.feedback', href: '/feedback?d=Womens' },
    { labelKey: 'footer.customerCare.links.accessibility', href: '/content/lp/accessibility?d=Womens' },
  ],
] satisfies FooterLink[][]

const informationLinks = [
  { labelKey: 'footer.information.links.about', href: '/aboutus?d=Womens' },
  { labelKey: 'footer.information.links.stores', href: '/stores?d=Womens' },
  { labelKey: 'footer.information.links.socialImpact', href: '#', external: true },
  { labelKey: 'footer.information.links.careers', href: '/r/Careers.jsp?d=Womens' },
  { labelKey: 'footer.information.links.ambassadors', href: '/content/ambassador?d=Womens' },
  { labelKey: 'footer.information.links.affiliate', href: '/affiliate' },
  { labelKey: 'footer.information.links.investors', href: '#', external: true },
  { labelKey: 'footer.information.links.press', href: '/content/lp/press-release?d=Womens' },
] satisfies FooterLink[]

const socialLinks = [
  { labelKey: 'footer.social.links.tiktok', href: '#', iconName: 'icon:tiktok' },
  { labelKey: 'footer.social.links.youtube', href: '#', iconName: 'icon:youtube' },
  { labelKey: 'footer.social.links.instagram', href: '#', iconName: 'icon:instagram' },
  { labelKey: 'footer.social.links.facebook', href: '#', iconName: 'icon:facebook' },
] satisfies SocialLink[]

const legalLinks = [
  { labelKey: 'footer.legal.terms', href: '/termsofuse' },
  { labelKey: 'footer.legal.privacy', href: '/privacypolicy' },
  { labelKey: 'footer.legal.cookiePreferences', href: '#' },
  { labelKey: 'footer.legal.caPrivacy', href: '/privacypolicy#privacy-ca-residents' },
  { labelKey: 'footer.legal.caTransparency', href: '/supplychainact' },
] satisfies FooterLink[]
</script>

<template>
  <footer
    class="mt-[144px] bg-black text-black"
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
      <div class="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 px-8 text-center md:grid-cols-3">
        <div class="mx-auto max-w-[360px]">
          <h3 class="mb-1 text-[14px] font-semibold uppercase leading-tight tracking-[0.083em]">
            {{ $t('footer.newsletter.title') }}
          </h3>
          <p class="mx-auto mb-3 text-[14px] leading-[1.55] text-black">
            {{ $t('footer.newsletter.copyBefore') }}
            <strong>{{ $t('footer.newsletter.discount') }}</strong>
            {{ $t('footer.newsletter.copyAfter') }}
            <a
              href="/privacypolicy"
              class="font-semibold underline"
            >
              {{ $t('footer.newsletter.privacy') }}
            </a>
          </p>

          <form
            class="flex items-end"
            @submit.prevent
          >
            <label
              class="sr-only"
              for="uandiplus-subscribe"
            >
              {{ $t('footer.newsletter.emailLabel') }}
            </label>
            <input
              id="uandiplus-subscribe"
              class="mt-2 min-h-[36px] flex-1 border border-r-0 border-black bg-transparent px-2 py-2 text-[13px] leading-none text-black placeholder:text-black"
              type="email"
              name="email"
              autocomplete="email"
              :placeholder="$t('footer.newsletter.placeholder')"
            >
            <button
              class="mt-2 flex min-h-[36px] w-[54px] items-center justify-center border border-black bg-black text-white"
              type="submit"
              :aria-label="$t('footer.newsletter.submit')"
            >
              <Icon
                name="icon:arrow-right"
                class="size-4"
              />
            </button>
          </form>
        </div>

        <div class="mx-auto max-w-[360px]">
          <h3 class="mb-1 text-[14px] font-semibold uppercase leading-tight tracking-[0.083em]">
            {{ $t('footer.survey.title') }}
          </h3>
          <p class="mb-1 text-[14px] leading-[1.55]">
            {{ $t('footer.survey.copy') }}
          </p>
          <a
            href="/r/nps_postvisit.jsp"
            class="text-[13px] font-semibold underline"
          >
            {{ $t('footer.survey.cta') }}
          </a>
        </div>

        <div class="mx-auto max-w-[360px]">
          <h3 class="mb-1 text-[14px] font-semibold uppercase leading-tight tracking-[0.083em]">
            {{ $t('footer.app.title') }}
          </h3>
          <p class="mb-3 text-[14px] leading-[1.55]">
            {{ $t('footer.app.copy') }}
          </p>
          <button
            class="inline-flex text-black"
            type="button"
            :aria-label="$t('footer.app.download')"
          >
            <Icon
              name="icon:apple"
              class="h-10 w-[120px]"
            />
          </button>
        </div>
      </div>
    </section>

    <section class="bg-black pt-8 text-white">
      <div class="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 px-8 lg:grid-cols-12">
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
                      class="text-[12px] leading-[1.7] text-[#949494] hover:text-white hover:underline"
                      :href="link.href"
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
                  <a
                    class="text-[12px] leading-[1.7] text-[#949494] hover:text-white hover:underline"
                    :href="link.href"
                    :target="link.external ? '_blank' : undefined"
                    :rel="link.external ? 'noreferrer noopener' : undefined"
                  >
                    {{ $t(link.labelKey) }}
                    <span
                      v-if="link.external"
                      class="sr-only"
                    >
                      {{ $t('footer.opensNewWindow') }}
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div class="mt-8 max-w-[320px] pb-8">
            <h3 class="mb-4 text-[14px] font-semibold uppercase leading-tight tracking-[0.083em]">
              {{ $t('footer.social.title') }}
            </h3>
            <ul class="flex gap-5">
              <li
                v-for="link in socialLinks"
                :key="link.labelKey"
              >
                <a
                  class="flex size-9 items-center justify-center rounded-full bg-white text-black hover:opacity-80"
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
          <a
            href="#"
            target="_blank"
            rel="noreferrer noopener"
            :aria-label="$t('footer.promo.ctaLabel')"
          >
            <img
              class="block h-auto w-full"
              src="https://is4.revolveassets.com/images/up/2025/July/070925_RW_FWRD_CrossPromoFooter_B_r.png"
              srcset="https://is4.revolveassets.com/images/up/2025/July/070925_RW_FWRD_CrossPromoFooter_B_r.png 1x, https://is4.revolveassets.com/images/up/2025/July/070925_RW_FWRD_CrossPromoFooter_B_r.png 2x"
              :alt="$t('footer.promo.alt')"
            >
          </a>
        </div>
      </div>
    </section>

    <section class="border-t border-[#3b3b3b] bg-black py-3">
      <div class="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-8 text-[10px] uppercase text-white min-[1320px]:flex-row min-[1320px]:items-center min-[1320px]:justify-between">
        <p class="text-[11px] normal-case text-[#949494]">
          {{ $t('footer.legal.copyright') }}
        </p>

        <nav :aria-label="$t('footer.legal.navLabel')">
          <ul class="flex flex-wrap items-center gap-x-7 gap-y-2">
            <li
              v-for="link in legalLinks"
              :key="link.labelKey"
            >
              <a
                class="hover:underline"
                :href="link.href"
              >
                {{ $t(link.labelKey) }}
              </a>
            </li>
            <li>
              <a
                class="inline-flex items-center gap-1 hover:underline"
                href="/r/DoNotSell.jsp"
              >
                {{ $t('footer.legal.privacyChoices') }}
                <Icon
                  name="icon:verification"
                  class="h-[14px] w-[30px]"
                />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  </footer>
</template>
