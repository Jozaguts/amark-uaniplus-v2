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
            <div class="lg:mx-auto lg:max-w-120">
              <div class="mb-8 text-center text-[18px] font-semibold uppercase tracking-[0.2em] text-primary lg:hidden">
                <span  @click="$router.push('/')">  {{ $t('auth.brand') }}</span>
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
                      <svg preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 32 32" class="ts-icon inline-block shrink-0" aria-hidden="true" focusable="false" role="presentation"><!--?lit$9743952402$--><g><path d="M30.4 16.628c0-1-.08-2.003-.254-2.986H16.29V19.3h7.935a6.8 6.8 0 0 1-2.937 4.465v3.67h4.735c2.78-2.559 4.377-6.337 4.377-10.806Z" fill="#4285F4"></path><path d="M16.29 30.98c3.962 0 7.303-1.3 9.738-3.546l-4.734-3.67c-1.317.896-3.018 1.403-4.998 1.403-3.833 0-7.082-2.586-8.248-6.062H3.163v3.784A14.692 14.692 0 0 0 16.29 30.98Z" fill="#34A853"></path><path d="M8.042 19.105a8.8 8.8 0 0 1 0-5.625V9.697h-4.88a14.703 14.703 0 0 0 0 13.192l4.88-3.784Z" fill="#FBBC04"></path><path d="M16.29 7.413a7.983 7.983 0 0 1 5.635 2.203l4.195-4.194A14.12 14.12 0 0 0 16.29 1.6 14.687 14.687 0 0 0 3.163 9.697l4.88 3.784c1.16-3.482 4.415-6.068 8.247-6.068Z" fill="#EA4335"></path></g></svg>
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
