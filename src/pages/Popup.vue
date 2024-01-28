<script lang="ts">
import browser from "webextension-polyfill";
import { CheckCircle, Cat } from "@vicons/fa";
import { regexMatch, getFilterList } from "../libs/storage";
import { darkTheme } from "naive-ui";
import type { DataTableColumns } from "naive-ui";
import type Action from "../backend/model";
import { defineComponent, ref } from "vue";
import ActionDetails from "../components/ActionDetails.vue";

export default defineComponent({
  // Components like icons or so
  components: {
    ActionDetails,
    CheckCircle,
    Cat,
  },

  data() {
    return {
      doesMatch: ref(false),
      matchRule: ref(""),
      filterList: ref(<Action[]>[]),
    };
  },

  setup() {
    // Create columns for the action detail table
    const createActionColumns = ({ }: {
      performAction: (row: Action) => void;
    }): DataTableColumns<Action> => {
      return [
        {
          title: "Image XPath",
          key: "image",
        },
        {
          title: "Input XPath",
          key: "input",
        },
      ];
    };

    // Detail drawer
    const drawerActive = ref(false);
    const activateDrawer = () => {
      drawerActive.value = true;
    };

    // Funtion to open the options page
    const openOptionsPage = () => {
      browser.runtime.openOptionsPage();
    };

    return {
      darkTheme,
      drawerActive,
      activateDrawer,
      actionDetailColumns: createActionColumns({
        performAction(){}
      }),
      openOptionsPage,
    };
  },

  async mounted() {
    const thisTabURL = await browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        return tabs[0].url;
      });
    const regexMatchResult = await regexMatch(thisTabURL!);
    const filterList = await getFilterList(regexMatchResult[1]);

    this.doesMatch = regexMatchResult[0];
    this.matchRule = regexMatchResult[1];
    this.filterList = filterList;
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
          <n-card title="Actions" size="small">
            <n-data-table :columns="actionDetailColumns" :data="filterList" :pagination="false" :bordered="false" />
          </n-card>
          <!-- <action-details :targetRule="matchRule" :cardSize="'small'" :editable="false"  /> -->
     
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
