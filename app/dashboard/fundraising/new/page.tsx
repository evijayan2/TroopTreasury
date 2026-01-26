import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CreateCampaignForm } from "@/components/fundraising/create-campaign-form"

export default async function NewCampaignPage() {
    const session = await auth()
    if (!session || !["ADMIN", "FINANCIER"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">New Fundraising Campaign</h1>
                <p className="text-gray-500">Create a new event or product sale.</p>
            </div>
            <CreateCampaignForm />
        </div>
    )
}
