import browser from "webextension-polyfill";
import Action from "../backend/model";

// Regex match
async function regexMatch(
	url: string
): Promise<[doesMatch: boolean, matchingRegex: string]> {
	// Find the regex that matches the current tab's URL
	const result = await browser.storage.sync.get("enabledFilter");
	const matchingRegex = result.enabledFilter.find((regex: string) =>
		new RegExp(regex).test(url ?? "")
	);
	return [matchingRegex !== undefined, matchingRegex];
}

// Get filter list
async function getFilterList(rule: string): Promise<Action[]> {
	const result = await browser.storage.sync.get("filterActions");
	return result.filterActions[rule];
}

// Get regex match list
async function getRegexMatchList(): Promise<string[]> {
	const result = await browser.storage.sync.get("enabledFilter");
	return result.enabledFilter;
}

// Append action to rule
async function appendActionToRule(rule: string, action: Action) {
	const result = await browser.storage.sync.get("filterActions");
	const filters = await browser.storage.sync.get("enabledFilter");
	// Null check for the rule
	if (result.filterActions[rule] === undefined) {
		if (filters.includes(rule)) {
			result.filterActions[rule] = [];
		} else {
			throw new Error("Rule does not exist");
		}
	}
	result.filterActions[rule].push(action);
	await browser.storage.sync.set({ filterActions: result.filterActions });
}

// Remove action from rule
async function removeActionFromRule(rule: string, action: Action) {
	const result = await browser.storage.sync.get("filterActions");
	// Null check for the rule
	if (result.filterActions[rule] === undefined) {
		throw new Error("Rule does not exist");
	}
	// Remove the action from the rule
	result.filterActions[rule] = result.filterActions[rule].filter(
		(a: Action) => a.image !== action.image || a.input !== action.input
	);
	await browser.storage.sync.set({ filterActions: result.filterActions });
}

// Add new rule
async function addNewRule(rule: string) {
	const result = await browser.storage.sync.get("enabledFilter");
	result.enabledFilter.push(rule);
	await browser.storage.sync.set({ enabledFilter: result.enabledFilter });

	// Make actions not null
	const actions = await browser.storage.sync.get("filterActions");
	actions.filterActions[rule] = [];
	await browser.storage.sync.set({ filterActions: actions.filterActions });
}

// Remove rule
async function removeRule(rule: string) {
	const result = await browser.storage.sync.get("enabledFilter");

	// Check if the rule exists
	if (!result.enabledFilter.includes(rule)) {
		throw new Error("Rule does not exist");
	}

	// Check if the rule has any actions
	const actions = await getFilterList(rule);
	if (actions.length > 0) {
		// If the rule has actions, remove them using the removeActionFromRule function
		for (const action of actions) {
			await removeActionFromRule(rule, action);
		}
	}

	// Remove the rule from the list
	result.enabledFilter = result.enabledFilter.filter((r: string) => r !== rule);
	await browser.storage.sync.set({ enabledFilter: result.enabledFilter });
}

// Does rule exist
async function doesRuleExist(rule: string): Promise<boolean> {
	const result = await browser.storage.sync.get("enabledFilter");
	return result.enabledFilter.includes(rule);
}

export {
	regexMatch,
	getFilterList,
	getRegexMatchList,
	appendActionToRule,
	removeActionFromRule,
	doesRuleExist,
	addNewRule,
	removeRule,
};
