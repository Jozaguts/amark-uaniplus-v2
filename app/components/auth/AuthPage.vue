<script setup lang="ts">
import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
import type { StorefrontFetchError } from '~~/types/storefront'
import {
  type ImplicitFlowErrorResponse,
  type ImplicitFlowSuccessResponse,
  useCodeClient,
} from 'vue3-google-signin'

type AuthPageProps = {
  title: string
  promptText: string
  promptLinkLabel: string
  promptLinkTo: string
  googleLabel: string
  submitLabel: string
  authAction?: 'register' | 'login'
  successRedirectTo?: string
  showForgotPassword?: boolean
}

const props = withDefaults(defineProps<AuthPageProps>(), {
  authAction: undefined,
  successRedirectTo: '/',
  showForgotPassword: false,
})

const { t } = useI18n()
const {
  authenticateWithGoogleCode,
  loginWithCredentials,
  registerWithCredentials,
} = useStorefrontAuth()
const { replayPendingProductCartAction } = useProductCart()

const formRef = shallowRef<FormInstance | null>(null)

const form = reactive({
  email: '',
  password: '',
})

const submitPending = shallowRef(false)
const googlePending = shallowRef(false)
const submitErrorMessage = shallowRef('')
const emailErrorMessage = shallowRef('')
const passwordErrorMessage = shallowRef('')

const googleRedirectUri = computed(() => {
  if (!import.meta.client)
    return undefined

  return `${window.location.origin}/auth/google/callback`
})

const validatePassword: FormItemRule['validator'] = (_rule, value, callback) => {
  if (!value) {
    callback(new Error(t('auth.validation.passwordRequired')))
    return
  }

  if (value.length < 6) {
    callback(new Error(t('auth.validation.passwordMinLength')))
    return
  }

  callback()
}

const rules = computed<FormRules<typeof form>>(() => ({
  email: [
    {
      required: true,
      message: t('auth.validation.emailRequired'),
      trigger: 'blur',
    },
    {
      type: 'email',
      message: t('auth.validation.emailInvalid'),
      trigger: ['blur', 'change'],
    },
  ],
  password: [
    {
      validator: validatePassword,
      trigger: 'blur',
    },
  ],
}))

watch(() => form.email, () => {
  emailErrorMessage.value = ''
  submitErrorMessage.value = ''
})

watch(() => form.password, () => {
  passwordErrorMessage.value = ''
  submitErrorMessage.value = ''
})

const clearSubmitErrors = () => {
  submitErrorMessage.value = ''
  emailErrorMessage.value = ''
  passwordErrorMessage.value = ''
}

const applyStorefrontValidationErrors = (error: StorefrontFetchError) => {
  const errors = error?.data?.errors

  emailErrorMessage.value = errors?.email?.[0] ?? ''
  passwordErrorMessage.value = errors?.password?.[0] ?? ''
  submitErrorMessage.value = error?.data?.message ?? t('auth.validation.requestFailed')
}

const submitAuthForm = async () => {
  if (!props.authAction || submitPending.value)
    return

  clearSubmitErrors()

  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitPending.value = true

  try {
    if (props.authAction === 'register')
      await registerWithCredentials(form.email, form.password)

    if (props.authAction === 'login')
      await loginWithCredentials(form.email, form.password)

    await replayPendingProductCartAction()
    await navigateTo(props.successRedirectTo)
  } catch (error) {
    applyStorefrontValidationErrors(error as StorefrontFetchError)
  } finally {
    submitPending.value = false
  }
}

const handleOnSuccess = async (response: ImplicitFlowSuccessResponse) => {
  googlePending.value = true
  clearSubmitErrors()

  try {
    await authenticateWithGoogleCode(response.code, googleRedirectUri.value)
    await replayPendingProductCartAction()
    await navigateTo(props.successRedirectTo)
  } catch (error) {
    applyStorefrontValidationErrors(error as StorefrontFetchError)
  } finally {
    googlePending.value = false
  }
}

const handleOnError = (errorResponse: ImplicitFlowErrorResponse) => {
  submitErrorMessage.value = errorResponse.error_description || t('auth.validation.googleFailed')
}

const { isReady, login } = useCodeClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError,
  redirect_uri: googleRedirectUri,
  ux_mode: 'popup',
  select_account: true,
})
</script>

<template>
  <main>
    <div class="min-h-screen lg:grid lg:grid-cols-2">
      <div class="min-h-screen overscroll-y-auto px-4 py-8 sm:px-0 lg:px-12 lg:py-6">
        <div class="flex min-h-full flex-col justify-between sm:mx-auto sm:w-[480px] lg:w-full lg:gap-y-4">
          <NuxtLink
            class="hidden text-[18px] font-semibold uppercase tracking-[0.2em] text-primary lg:block lg:w-max"
            to="/"
          >
            {{ $t('auth.brand') }}
          </NuxtLink>

          <div class="w-full">
            <div class="lg:mx-auto lg:max-w-[480px]">
              <div class="mb-8 text-center text-[18px] font-semibold uppercase tracking-[0.2em] text-primary lg:hidden">
                {{ $t('auth.brand') }}
              </div>

              <div class="mb-8 space-y-4 text-center lg:text-left">
                <h1 class="text-[32px] font-semibold leading-[1.2] tracking-[0.32px] text-primary lg:text-[40px]">
                  {{ props.title }}
                </h1>
                <p class="text-base">
                  <span class="text-secondary">{{ props.promptText }}</span>
                  <NuxtLink
                    class="ml-1 font-medium text-primary underline"
                    :to="props.promptLinkTo"
                  >
                    {{ props.promptLinkLabel }}
                  </NuxtLink>
                </p>
              </div>

              <div class="flex flex-col justify-center gap-y-4">
                <ClientOnly>
                  <ElButton
                    class="el-button ts-button ts-button__outline-light google-btn_tep !h-12 !rounded-full"
                    :disabled="!isReady || googlePending"
                    :loading="googlePending"
                    @click="login"
                  >
                    <span>
                      <Icon
                        name="ruuul:google"
                        class="ts-icon"
                        size="1em"
                      />
                      <span class="ml-2">{{ props.googleLabel }}</span>
                    </span>
                  </ElButton>
                </ClientOnly>
              </div>

              <div class="relative my-8 h-px w-full bg-borderSecondary">
                <span class="absolute left-1/2 top-1/2 inline-block -translate-x-1/2 -translate-y-1/2 bg-regular px-3 text-sm font-medium leading-[1.3] tracking-[0.28px] text-secondary">
                  {{ $t('auth.or') }}
                </span>
              </div>

              <ElForm
                ref="formRef"
                class="ts-form mb-6 space-y-4"
                size="large"
                :model="form"
                :rules="rules"
                @submit.prevent="submitAuthForm"
              >
                <ElFormItem
                  prop="email"
                  :error="emailErrorMessage"
                >
                  <ElInput
                    v-model="form.email"
                    type="email"
                    :placeholder="$t('auth.form.emailPlaceholder')"
                  />
                </ElFormItem>

                <ElFormItem
                  prop="password"
                  :error="passwordErrorMessage"
                >
                  <ElInput
                    v-model="form.password"
                    type="password"
                    :placeholder="$t('auth.form.passwordPlaceholder')"
                  />
                </ElFormItem>
              </ElForm>

              <div class="space-y-2">
                <ElButton
                  round
                  size="large"
                  class="el-button ts-button ts-button__lg ts-button__filled-dark w-full"
                  :loading="submitPending"
                  @click="submitAuthForm"
                >
                  <span>{{ props.submitLabel }}</span>
                </ElButton>

                <p
                  v-if="submitErrorMessage"
                  class="text-sm text-[#b42318]"
                >
                  {{ submitErrorMessage }}
                </p>

                <div
                  v-if="props.showForgotPassword"
                  class="mt-6 flex w-full justify-center"
                >
                  <NuxtLink
                    class="text-base font-medium text-primary underline"
                    to="/forgot-password"
                  >
                    {{ $t('auth.forgotPassword') }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <div class="w-full">
            <div class="text-center text-sm text-tertiary">
              <p>
                {{ $t('auth.legal.before') }}
                <NuxtLink
                  class="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  to="/"
                >
                  {{ $t('auth.legal.terms') }}
                </NuxtLink>
                {{ $t('auth.legal.between') }}
                <NuxtLink
                  class="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  to="/"
                >
                  {{ $t('auth.legal.privacy') }}
                </NuxtLink>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="hidden lg:flex lg:h-screen lg:w-full">
        <img
          class="w-full object-cover"
          src="/images/login_01.jpg"
          :alt="$t('auth.coverAlt')"
          width="2048"
          height="2731"
        >
      </div>
    </div>
  </main>
</template>
