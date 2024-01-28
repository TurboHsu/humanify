<script lang="ts">
import { DataTableColumns, NButton, useMessage } from "naive-ui";
import { defineComponent, h, ref } from "vue";
import Action from "../backend/model";
import {
	getFilterList,
	getRegexMatchList,
	removeRule,
	addNewRule,
	appendActionToRule,
	doesRuleExist,
} from "../libs/storage";
import { onMounted } from "vue";
import ActionDetails from "./ActionDetails.vue";
import { toValue } from "vue";

export default defineComponent({
	setup() {
		const message = useMessage();

		type RowData = {
			rule: string; // Rule
			actions: Action[]; // Maybe remove?
		};

		type ModalActionData = {
			key: string;
			value: string;
		};

		let newRuleModalActionData = ref(<ModalActionData[]>[]);
		let newRuleModalRuleData = ref("");
		let showNewDataModal = ref(false);

		const createColumns = ({
			deleteRuleAction,
		}: {
			deleteRuleAction: (rowData: RowData) => void;
		}): DataTableColumns<RowData> => {
			return [
				{
					type: "expand",
					expandable: (rowData) => {
						return rowData.actions.length > 0;
					},
					renderExpand: (rowData) => {
						return h(ActionDetails, {
							targetRule: rowData.rule,
							editable: true,
							cardSize: "small",
						});
					},
				},
				{
					title: "Rule",
					key: "rule",
				},
				{
					title: "Action",
					key: "actions",
					render(row) {
						return h(
							NButton,
							{
								size: "small",
								onClick: () => deleteRuleAction(row),
							},
							{ default: () => "Delete" }
						);
					},
				},
			];
		};

		// For row key in data table
		function createRowKey(row: RowData) {
			return row.rule;
		}

		const ruleData = ref(<RowData[]>[]);
		const columns = createColumns({
			deleteRuleAction: (rowData) => {
				deleteRuleAction(rowData);
			},
		});
		const pagination = {
			pageSize: 5,
		};

		// Fetches data from storage
		function updateData() {
			getRegexMatchList().then((list) => {
				const promises = list.map(async (element) => {
					const actions = await getFilterList(element);
					return {
						rule: element,
						actions: actions,
					};
				});
				Promise.all(promises).then((data: RowData[]) => {
					ruleData.value = data;
				});
			});
		}

		// Delete rule function
		function deleteRuleAction(rowData: RowData) {
			removeRule(rowData.rule).then(() => {
				updateData();
				message.success("Rule deleted");
			});
		}

		// Submit new rule function
		async function createNewRuleFromModal() {
			const rule = toValue(newRuleModalRuleData);
			if (rule === "") {
				message.error("Rule cannot be empty");
				return;
			}
			if (await doesRuleExist(rule)) {
				message.error("Rule already exists");
				return;
			}
			const actions = toValue(newRuleModalActionData);
			if (actions.length === 0) {
				message.error("Actions cannot be empty");
				return;
			}
			addNewRule(rule).then(async () => {
				for (const element of actions) {
					const imageXPath = element.key;
					const inputXPath = element.value;
					await appendActionToRule(rule, <Action>{
						image: imageXPath,
						input: inputXPath,
					});
				}
				updateData();
				message.success("Rule added");

				// Close modal
				showNewDataModal.value = false;

				// Clear data
				newRuleModalActionData.value = [];
				newRuleModalRuleData.value = "";
			});
		}

		onMounted(() => {
			updateData();
		});

		return {
			ruleData,
			columns,
			pagination,
			newRuleModalActionData,
			newRuleModalRuleData,
			showNewDataModal,
			createNewRuleFromModal,
			createRowKey,
		};
	},
});
</script>

<template>
	<n-space vertical size="large">
		<n-h2 prefix="bar">
			<n-text>Rules</n-text>
			<n-button
				size="medium"
				type="primary"
				@click="showNewDataModal = true"
				style="float: right"
				>New</n-button
			>
		</n-h2>
		<div style="font-size: medium">
			<n-text>
				Rules defined how Humanify should behave.<br />
				When a new tab is opened, Humanify will check if the URL matches any of
				the rules.<br />
				If it does, Humanify will perform the actions defined in the rule.
			</n-text>
		</div>
		<n-data-table
			:columns="columns"
			:data="ruleData"
			:pagination="pagination"
			:row-key="createRowKey"
		/>
	</n-space>

	<!-- Modals -->
	<n-modal
		v-model:show="showNewDataModal"
		class="custom-card"
		preset="card"
		:style="{ width: '50%' }"
		title="New rule"
		size="huge"
		:bordered="false"
	>
		<n-card title="URL Matching Rule" size="small">
			<n-space vertical>
				<div>
					<n-text type="primary">URL</n-text>
					<n-text> is matched against the following regex.</n-text>
				</div>
				<n-input placeholder="Regex" v-model:value="newRuleModalRuleData" />
			</n-space>
		</n-card>
		<n-card title="Actions" size="small">
			<n-space vertical>
				<div>
					<n-text>Actions are performed when the URL matches.</n-text>
				</div>
				<div>
					<n-text type="primary">Image XPath</n-text>
					<n-text> is the XPath of the CAPTCHA image.</n-text>
				</div>
				<div>
					<n-text type="primary">Input XPath</n-text>
					<n-text> is the XPath of the input field.</n-text>
				</div>
				<n-dynamic-input
					preset="pair"
					key-placeholder="Image XPath"
					value-placeholder="Input XPath"
					v-model:value="newRuleModalActionData"
				/>
			</n-space>
		</n-card>
		<template #footer>
			<n-button
				type="primary"
				@click="createNewRuleFromModal()"
				style="float: right"
				>Submit</n-button
			>
		</template>
	</n-modal>
</template>
