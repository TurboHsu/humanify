<script lang="ts">
import { NButton, useMessage } from "naive-ui";
import { defineComponent, ref, h } from "vue";
import {
	getFilterList,
	removeActionFromRule,
	appendActionToRule,
} from "../libs/storage";
import type Action from "../backend/model";
import type { DataTableColumns } from "naive-ui";
import { onMounted } from "vue";
import { keysOf } from "naive-ui/es/_utils";

export default defineComponent({
	props: {
		targetRule: {
			type: String,
			required: true,
		},
		editable: {
			type: Boolean,
			required: true,
		},
		cardSize: {
			type: String,
			required: true,
		},
	},
	setup(props) {
		const message = useMessage();

		// For the drawer input
		type DrawerActionData = {
			key: string;
			value: string;
		};

		// Create columns for the action detail table
		const createActionColumns = ({}: {
			parseAction: (row: Action) => void;
		}): DataTableColumns<Action> => {
			return props.editable
				? [
						{
							title: "Image XPath",
							key: "image",
						},
						{
							title: "Input XPath",
							key: "input",
						},
						{
							title: "Action",
							key: "action",
							render(row) {
								return props.editable
									? h(
											NButton,
											{
												size: "small",
												onClick: () => deleteAction(row),
											},
											{
												default: () => "Delete",
											}
									  )
									: null;
							},
						},
				  ]
				: [
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

		function createRowKey(row: Action) {
			return row.image + row.input;
		}

		async function updateData() {
			actionList.value = await getFilterList(props.targetRule);
		}

		function deleteAction(row: Action) {
			removeActionFromRule(props.targetRule, row).then(() => {
				message.success("Action deleted");
				updateData();
			});
		}

		// For the drawer
		async function createNewActionFromDrawer() {
			const data = newRuleDrawerActionData.value;
			for (const element of data) {
				const newAction: Action = {
					image: element.key,
					input: element.value,
				};
				await appendActionToRule(props.targetRule, newAction);
			}

			message.success("Action added");
			updateData();
			showDrawer.value = false;
		}

		let actionList = ref(<Action[]>[]);
		let showDrawer = ref(false);
		let newRuleDrawerActionData = ref(<DrawerActionData[]>[]);

		onMounted(() => {
			updateData();
		});

		return {
			actionList,
			showDrawer,
			createNewActionFromDrawer,
			newRuleDrawerActionData,
			actionColumns: createActionColumns({
				parseAction() {},
			}),
			editable: props.editable,
			cardSize: props.cardSize as "small" | "medium" | "large" | "huge",
			createRowKey,
		};
	},
});
</script>

<template>
	<n-space vertical>
		<n-card :size="cardSize">
			<template #header>
				<span>Actions</span>
				<n-button
					class="add-button"
					size="small"
					type="primary"
					@click="showDrawer = true"
					v-if="editable"
					>+</n-button
				>
			</template>
			<n-data-table
				:data="actionList"
				:columns="actionColumns"
				:pagination="false"
				:bordered="false"
				:row-key="createRowKey"
			/>
		</n-card>
	</n-space>
	<n-drawer v-model:show="showDrawer" placement="bottom" height="60%">
		<n-drawer-content>
			<n-card title="Add Action" :bordered="false">
				<n-dynamic-input
					preset="pair"
					key-placeholder="Image XPath"
					value-placeholder="Input XPath"
					v-model:value="newRuleDrawerActionData"
				/>
			</n-card>
			<template #footer>
				<n-button
					type="primary"
					@click="createNewActionFromDrawer()"
					style="float: right"
					>Submit</n-button
				>
			</template>
		</n-drawer-content>
	</n-drawer>
</template>

<style scoped>
.add-button {
	float: right;
}
</style>
