import { useAppTranslation } from "@/i18n/TranslationContext"
import { VSCodeCheckbox, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"
import { SetCachedStateField } from "./types"
import { Server } from "lucide-react"

interface WebSocketSettingsProps {
	websocketServerEnabled: boolean
	websocketServerPort: number
	setCachedStateField: SetCachedStateField<"websocketServerEnabled" | "websocketServerPort">
}

export const WebSocketSettings = ({
	websocketServerEnabled,
	websocketServerPort,
	setCachedStateField,
}: WebSocketSettingsProps) => {
	const { t } = useAppTranslation()

	return (
		<>
			<SectionHeader>
				<div className="flex items-center gap-2">
					<Server className="w-4" />
					<div>{t("settings:sections.websocket")}</div>
				</div>
			</SectionHeader>

			<Section>
				<div className="mt-1">
					<VSCodeCheckbox
						className="leading-none"
						checked={websocketServerEnabled}
						onChange={(e: any) => setCachedStateField("websocketServerEnabled", e.target.checked)}>
						<span className="font-medium">{t("settings:websocket.enable")}</span>
					</VSCodeCheckbox>
					<p className="mt-1 text-sm text-vscode-descriptionForeground">
						{t("settings:websocket.enableDescription")}
					</p>
				</div>

				<div className="mt-2">
					<label htmlFor="websocketServerPort" className="font-medium block mb-2">
						{t("settings:websocket.port")}
					</label>
					<VSCodeTextField
						id="websocketServerPort"
						value={String(websocketServerPort)}
						onChange={(e: any) => {
							const value = parseInt(e.target.value, 10)
							if (!isNaN(value) && value >= 1024 && value <= 65535) {
								setCachedStateField("websocketServerPort", value)
							}
						}}
						placeholder="7800"
					/>
					<p className="mt-1 text-sm text-vscode-descriptionForeground">
						{t("settings:websocket.portDescription")}
					</p>
				</div>
			</Section>
		</>
	)
}
