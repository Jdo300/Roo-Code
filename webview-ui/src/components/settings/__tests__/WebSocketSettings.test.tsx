// npx jest src/components/settings/__tests__/WebSocketSettings.test.tsx

import { render, screen, fireEvent } from "@testing-library/react"
import { WebSocketSettings } from "../WebSocketSettings"

// Mock the translation hook
jest.mock("@/i18n/TranslationContext", () => ({
	useAppTranslation: () => ({
		t: (key: string) => key, // Return the key as the translated text for testing
	}),
}))

// Mock VSCode components
jest.mock("@vscode/webview-ui-toolkit/react", () => ({
	VSCodeCheckbox: ({ checked, onChange, children }: any) => (
		<label>
			<input
				type="checkbox"
				checked={checked}
				onChange={onChange}
				data-testid="websocket-server-enabled-checkbox"
			/>
			{children}
		</label>
	),
	VSCodeTextField: ({ id, value, onChange, placeholder }: any) => (
		<input
			id={id}
			type="text"
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			data-testid="websocket-server-port-input"
		/>
	),
}))

// Mock lucide-react components
jest.mock("lucide-react", () => ({
	Server: () => <div data-testid="server-icon">Server Icon</div>,
}))

// Mock SectionHeader and Section components
jest.mock("../SectionHeader", () => ({
	SectionHeader: ({ children }: any) => <div data-testid="section-header">{children}</div>,
}))

jest.mock("../Section", () => ({
	Section: ({ children }: any) => <div data-testid="section">{children}</div>,
}))

describe("WebSocketSettings", () => {
	const defaultProps = {
		websocketServerEnabled: false,
		websocketServerPort: 7800,
		setCachedStateField: jest.fn(),
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it("renders all controls", () => {
		render(<WebSocketSettings {...defaultProps} />)

		// Check for the enable server checkbox
		const enableCheckbox = screen.getByTestId("websocket-server-enabled-checkbox")
		expect(enableCheckbox).toBeInTheDocument()
		expect(enableCheckbox).not.toBeChecked()

		// Check for the port input
		const portInput = screen.getByTestId("websocket-server-port-input")
		expect(portInput).toBeInTheDocument()
		expect(portInput).toHaveValue("7800")
	})

	it("renders with server enabled", () => {
		render(<WebSocketSettings {...defaultProps} websocketServerEnabled={true} />)

		const enableCheckbox = screen.getByTestId("websocket-server-enabled-checkbox")
		expect(enableCheckbox).toBeChecked()
	})

	it("updates server enabled setting when checkbox is clicked", () => {
		render(<WebSocketSettings {...defaultProps} />)

		const enableCheckbox = screen.getByTestId("websocket-server-enabled-checkbox")
		fireEvent.click(enableCheckbox)

		expect(defaultProps.setCachedStateField).toHaveBeenCalledWith("websocketServerEnabled", true)
	})

	it("updates port when valid input is provided", () => {
		render(<WebSocketSettings {...defaultProps} />)

		const portInput = screen.getByTestId("websocket-server-port-input")
		fireEvent.change(portInput, { target: { value: "8080" } })

		expect(defaultProps.setCachedStateField).toHaveBeenCalledWith("websocketServerPort", 8080)
	})

	it("does not update port when input is below minimum range", () => {
		render(<WebSocketSettings {...defaultProps} />)

		const portInput = screen.getByTestId("websocket-server-port-input")
		fireEvent.change(portInput, { target: { value: "1000" } })

		expect(defaultProps.setCachedStateField).not.toHaveBeenCalled()
	})

	it("does not update port when input is above maximum range", () => {
		render(<WebSocketSettings {...defaultProps} />)

		const portInput = screen.getByTestId("websocket-server-port-input")
		fireEvent.change(portInput, { target: { value: "70000" } })

		expect(defaultProps.setCachedStateField).not.toHaveBeenCalled()
	})

	it("does not update port when input is not a number", () => {
		render(<WebSocketSettings {...defaultProps} />)

		const portInput = screen.getByTestId("websocket-server-port-input")
		fireEvent.change(portInput, { target: { value: "invalid" } })

		expect(defaultProps.setCachedStateField).not.toHaveBeenCalled()
	})
})
