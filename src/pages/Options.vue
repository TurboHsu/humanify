<script lang="ts">
import { ref, h, defineComponent } from "vue";
import { NIcon, darkTheme } from "naive-ui";
import type { MenuOption } from "naive-ui";
import { Info, List } from "@vicons/fa";
import RuleConfiguration from "../components/RuleConfiguration.vue";

const sidebarMenuOptions: MenuOption[] = [
	{
		label: "Rules",
		key: "rules",
		icon: () => h(List),
	},
	{
		label: "About",
		key: "about",
		icon: () => h(Info),
	},
];

export default defineComponent({
	components: {
		RuleConfiguration
	},
	setup() {
		const renderSidebarMenuLabel = (option: MenuOption) => {
			return option.label as string;
		};
		const renderSidebarMenuIcon = (option: MenuOption) => {
			return h(NIcon, null, { default: option.icon });
		};

		return {
			sidebarCollapsed: ref(false),
			sidebarValue: ref("rules"),
			darkTheme,
			sidebarMenuOptions,
			renderSidebarMenuIcon,
			renderSidebarMenuLabel,
		};
	},
});
</script>

<template>
	<n-config-provider :theme="darkTheme">
		<n-space vertical>
			<n-layout has-sider>
				<n-layout-sider
					bordered
					collapse-mode="width"
					:collapsed-width="64"
					:width="240"
					:collapsed="sidebarCollapsed"
					show-trigger
					@collapse="sidebarCollapsed = true"
					@expand="sidebarCollapsed = false"
				>
					<n-menu
						:collapsed="sidebarCollapsed"
						:collapsed-width="64"
						:collapsed-icon-size="22"
						:options="sidebarMenuOptions"
						:render-label="renderSidebarMenuLabel"
						:render-icon="renderSidebarMenuIcon"
						:expand-icon="renderSidebarMenuIcon"
						v-model:value="sidebarValue"
					/>
				</n-layout-sider>
				<div class="parent-container">
					<n-layout-header>
						<n-h1>
							<n-text type="primary">Humanify</n-text>
							<n-text> Settings</n-text>
						</n-h1>
					</n-layout-header>
					<n-layout-content content-style="padding: 24px">
						<n-message-provider>
							<rule-configuration v-if="sidebarValue === 'rules'" />
						</n-message-provider>
					</n-layout-content>
				</div>
			</n-layout>
		</n-space>
	</n-config-provider>
</template>

<style scoped>
body,
html {
	overflow: hidden;
	background-color: #1e1e1e;
	display: flex;
}

.n-layout-header,
.n-layout-footer {
	background: rgba(128, 128, 128, 0.2);
	padding: 24px;
}

.n-layout-sider {
	background: rgba(128, 128, 128, 0.3);
}

.n-layout-content {
	background: rgba(128, 128, 128, 0.4);
	flex-grow: 1;
}

.parent-container {
	height: 100vh;
	width: 100%;
	display: flex;
	flex-direction: column;
}
</style>
