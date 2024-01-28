<script lang="ts">
import browser from "webextension-polyfill";
import { CheckCircle, Cat } from "@vicons/fa";
import { regexMatch } from "../libs/storage";
import { darkTheme } from "naive-ui";
import { defineComponent, ref } from "vue";
import ActionDetails from "../components/ActionDetails.vue";
import { onMounted } from "vue";

export default defineComponent({
  // Components like icons or so
  components: {
    ActionDetails,
    CheckCircle,
    Cat,
  },
  setup() {
    // Detail drawer
    const drawerActive = ref(false);
    const activateDrawer = () => {
      drawerActive.value = true;
    };
    
    // Funtion to open the options page
    const openOptionsPage = () => {
      browser.runtime.openOptionsPage();
    };

    let doesMatch = ref(false);
    let matchRule = ref("");

    onMounted(async () => {
      const thisTabURL = await browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        return tabs[0].url;
      });
      const regexMatchResult = await regexMatch(thisTabURL!);
      
      doesMatch.value = regexMatchResult[0];
      matchRule.value = regexMatchResult[1];
    });
    
    return {
      darkTheme,
      drawerActive,
      activateDrawer,
      openOptionsPage,
      doesMatch,
      matchRule,
    };
  },
});
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-space vertical size="large">
      <!-- Did stuff -->
      <n-result title="Humanified" description="CAPTCHA is processed by Humanify." v-if="doesMatch">
        <template #icon>
          <n-icon size="100px" color="green">
            <check-circle />
          </n-icon>
        </template>
        <template #footer>
          <n-space justify="space-around" size="large">
            <n-button @click="activateDrawer">Show Details</n-button>
            <n-button @click="openOptionsPage">Edit Rules</n-button>
          </n-space>
        </template>
      </n-result>
      
      <!-- Did nothing -->
      <n-result title="Hmmm" description="Humanify did nothing!" v-else>
        <template #icon>
          <n-icon size="100px" color="#lightgrey">
            <cat />
          </n-icon>
        </template>
        <template #footer>
          <n-space justify="space-around" size="large">
            <n-button @click="openOptionsPage">Edit Rules</n-button>
          </n-space>
        </template>
      </n-result>
    </n-space>

    <n-drawer v-model:show="drawerActive" :placement="'bottom'" height="80%">
      <n-drawer-content title="Details">
        <n-space vertical size="small">
          <n-card title="Matching Rule" size="small">
            <n-input v-model:value="matchRule" readonly />
          </n-card>
          <n-message-provider>
            <action-details :targetRule="matchRule" :cardSize="'small'" :editable="false"  />
          </n-message-provider>
        </n-space>
      </n-drawer-content>

    </n-drawer>
  </n-config-provider>
</template>

<style>
html,
body {
  width: 400px;
  height: 400px;
  background-color: #1e1e1e;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.center-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
