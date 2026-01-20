
import { generateReplayJson } from '../app/actions/export-db-script';

async function verify() {
    try {
        const json = await generateReplayJson();
        const data = JSON.parse(json);
        console.log("Keys in export:", Object.keys(data));
        console.log("Budgets count:", data.budgets?.length);
        console.log("Fundraising Campaigns count:", data.fundraisingCampaigns?.length);
    } catch (e) {
        console.error(e);
    }
}

verify();
