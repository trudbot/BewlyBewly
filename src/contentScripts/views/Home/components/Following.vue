<script setup lang="ts">
import type { Ref } from 'vue'
import type { MomentModel } from '../types'
import emitter from '~/utils/mitt'

const videoList = reactive<MomentModel[]>([])
const isLoading = ref<boolean>(false)
const needToLoginFirst = ref<boolean>(false)
const containerRef = ref<HTMLElement>() as Ref<HTMLElement>
const offset = ref<string>('')
const updateBaseline = ref<string>('')

onMounted(async () => {
  for (let i = 0; i < 3; i++)
    await getFollowingAuthorVideos()

  emitter.off('reachBottom')
  emitter.on('reachBottom', async () => {
    if (!isLoading.value) {
      for (let i = 0; i < 3; i++)
        await getFollowingAuthorVideos()
    }
  })
})

onUnmounted(() => {
  emitter.off('reachBottom')
})

async function getFollowingAuthorVideos() {
  isLoading.value = true
  try {
    const response = await browser.runtime.sendMessage({
      contentScriptQuery: 'getMoments',
      type: 'video',
      offset: offset.value,
      updateBaseline: updateBaseline.value,
    })

    if (response.code === 0) {
      offset.value = response.data.offset
      updateBaseline.value = response.data.update_baseline

      const resData = [] as MomentModel[]

      response.data.items.forEach((item: MomentModel) => {
        resData.push(item)
      })

      // when videoList has length property, it means it is the first time to load
      if (!videoList.length) {
        Object.assign(videoList, resData)
      }
      else {
        // else we concat the new data to the old data
        Object.assign(videoList, videoList.concat(resData))
      }
    }
    else if (response.code === -101) {
      needToLoginFirst.value = true
    }
  }
  finally {
    isLoading.value = false
  }
}

function jumpToLoginPage() {
  location.href = 'https://passport.bilibili.com/login'
}
</script>

<template>
  <div>
    <Empty v-if="needToLoginFirst" mt-6 :description="$t('common.please_log_in_first')">
      <Button type="primary" @click="jumpToLoginPage()">
        {{ $t('common.login') }}
      </Button>
    </Empty>
    <div
      v-else
      ref="containerRef"
      m="b-0 t-0" relative w-full h-full
      grid="~ 2xl:cols-5 xl:cols-4 lg:cols-3 md:cols-2 gap-4"
    >
      <VideoCard
        v-for="video in videoList"
        :id="Number(video.modules.module_dynamic.major.archive.aid)"
        :key="video.modules.module_dynamic.major.archive.aid"
        :duration-str="video.modules.module_dynamic.major.archive.duration_text"
        :title="video.modules.module_dynamic.major.archive.title"
        :cover="video.modules.module_dynamic.major.archive.cover"
        :author="video.modules.module_author.name"
        :author-face="video.modules.module_author.face"
        :mid="video.modules.module_author.mid"
        :view-str="video.modules.module_dynamic.major.archive.stat.play"
        :danmaku-str="video.modules.module_dynamic.major.archive.stat.danmaku"
        :capsule-text="video.modules.module_author.pub_time"
        :bvid="video.modules.module_dynamic.major.archive.bvid"
      />

      <!-- skeleton -->
      <template v-for="item in 30" :key="item">
        <div
          v-if="isLoading"
          mb-8 pointer-events-none select-none
        >
          <div aspect-video bg="$bew-fill-4" rounded="$bew-radius" />
          <div flex mt-4>
            <div m="r-4" w="40px" h="40px" rounded="1/2" bg="$bew-fill-4" shrink-0 />
            <div w-full>
              <div grid gap-2>
                <div w-full h-5 bg="$bew-fill-3" />
                <div w="3/4" h-5 bg="$bew-fill-3" />
              </div>
              <div grid gap-2 mt-4>
                <div w="50%" h-4 bg="$bew-fill-2" />
                <div w="80%" h-4 bg="$bew-fill-2" />
              </div>
              <div text="transparent sm" inline-block mt-4 p="x-2 y-1" bg="$bew-fill-1" rounded-4>
                hello world
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <Transition name="fade">
      <Loading v-if="isLoading" />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
</style>
../types
