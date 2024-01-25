<script lang="ts">
import { DataTableColumns, NButton } from "naive-ui";
import { defineComponent, h, ref } from "vue";
import Action from "../backend/model";
import { getFilterList, getRegexMatchList } from "../libs/storage";
import { onMounted } from "vue";

type RowData = {
	rule: string;
	actions: Action[];
};

const createColumns = ({
	sendMail,
}: {
	sendMail: (rowData: RowData) => void;
}): DataTableColumns<RowData> => {
	return [
		{
			type: "expand",
			expandable: (rowData) => {
				return rowData.actions.length > 0;
			},
			renderExpand: (rowData) => {
				// Get all actions in one string
				const actions = rowData.actions.map((action) => {
					return `${action.image} -> ${action.input}`;
				});
				return h(
					"div",
					null,
					actions.map((action) => {
						return h("p", null, action);
					})
				);
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
						onClick: () => sendMail(row),
					},
					{ default: () => "Delete" }
				);
			},
		},
	];
};

export default defineComponent({
	setup() {
		const ruleData = ref(<RowData[]>[]);
		const columns = createColumns({
			sendMail: (rowData) => {
				console.log(rowData);
			},
		});
		const pagination = {
			pageSize: 5,
		};

		// Fetches data from storage
		function createData() {
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

		onMounted(() => {
			createData();
		});

		return {
			ruleData,
			columns,
			pagination,
			showNewDataModal: ref(false),
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
		<div style="font-size: medium;">
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
			default-expand-all
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
				<n-input placeholder="Regex" />
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
				/>
			</n-space>
		</n-card>
		<template #footer>
			<n-button type="primary" @click="" style="float: right">Submit</n-button>
		</template>
	</n-modal>
</template>
