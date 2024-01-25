import browser from "webextension-polyfill";
import Action from "../backend/model";

// Regex match
async function regexMatch(url: string): Promise<[ doesMatch: boolean, matchingRegex: string]> {
    // Find the regex that matches the current tab's URL
    const result = await browser.storage.sync.get("enabledFilter");
    const matchingRegex = result.enabledFilter.find((regex: string) => new RegExp(regex).test(url ?? ""));
    return [ matchingRegex !== undefined, matchingRegex ];
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

export { regexMatch, getFilterList, getRegexMatchList };