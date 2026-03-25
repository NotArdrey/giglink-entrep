# GigLink - Dynamic System Justification

This document is presentation-ready. It explains not only what each feature is and where the code exists, but also how each feature becomes dynamic at runtime.

## Dynamic Features (Defense Notes)

### 1. State-Driven Page Navigation
- What it is: The app switches screens without full page reloads.
- How it appears: Users move between Dashboard, My Bookings, My Work, Profile, Settings, and Seller Onboarding smoothly.
- How it becomes dynamic: `currentView` is stored in React state, so navigation is data-driven instead of URL hard refresh. Button handlers mutate that state (`setCurrentView(...)`), and React immediately re-renders only the branch that matches the new value. This is why moving between sections feels instant.
- Utilized at: `src/App.js:33`, `src/App.js:115`, `src/App.js:119`, `src/App.js:209`, `src/App.js:278`
- Code proof: `src/App.js:33`, `src/App.js:209`, `src/App.js:224`, `src/App.js:278`

### 2. Floating Seller Onboarding (Modal Flow)
- What it is: "Become a Seller" opens as a floating overlay instead of a separate page.
- How it appears: The current screen stays visible in the background while the 3-step onboarding is completed in a modal-like container.
- How it becomes dynamic: A boolean state flag (`isSellerOnboardingOpen`) controls whether the overlay node exists in the render tree. When user clicks "Become a Seller", this becomes `true`, the overlay mounts, and onboarding appears above the active page. When closed or completed, it becomes `false`, and React unmounts the overlay. No route replacement is needed.
- Utilized at: `src/App.js:43`, `src/App.js:115`, `src/App.js:186`, `src/App.css:51`, `src/pages/SellerOnboarding.js:7`, `src/styles/SellerOnboarding.css:12`
- Code proof: `src/App.js:186`, `src/App.js:197`, `src/App.css:51`, `src/styles/SellerOnboarding.css:44`

### 3. Parent-Child Communication Pattern
- What it is: Parent components hold business logic; child components focus on display and user interactions.
- How it appears: Child modals/windows (chat, payment, slot selection, onboarding) trigger parent updates.
- How it becomes dynamic: Parent components pass callback functions as props, then child components call those callbacks after user actions. The parent updates shared state (booking status, selected slot, payment method, stop request), and all dependent children re-render from that updated state. This creates synchronized UI without direct child-to-child coupling.
- Utilized at: `src/pages/MyBookings.js:758`, `src/pages/MyBookings.js:762`, `src/pages/MyBookings.js:777`, `src/pages/MyBookings.js:780`, `src/components/PaymentModal.js:88`, `src/components/ChatWindow.js:154`
- Code proof: `src/pages/MyBookings.js:780`, `src/components/PaymentModal.js:88`, `src/components/ChatWindow.js:18`

### 4. Multi-Step Seller Form (Steps 1-3)
- What it is: Progressive onboarding with validation at each step.
- How it appears: Fields and sections change as user clicks Next/Back; errors appear only when requirements are unmet.
- How it becomes dynamic: `step`, `formData`, and `errorMessage` are reactive states. `handleNext` validates current step before incrementing the step index. JSX blocks are conditionally rendered by `step`, so the form layout changes in real time while preserving previously entered values in `formData`.
- Utilized at: `src/pages/SellerOnboarding.js:8`, `src/pages/SellerOnboarding.js:10`, `src/pages/SellerOnboarding.js:11`, `src/pages/SellerOnboarding.js:34`, `src/pages/SellerOnboarding.js:63`
- Code proof: `src/pages/SellerOnboarding.js:34`, `src/pages/SellerOnboarding.js:126`, `src/pages/SellerOnboarding.js:180`, `src/pages/SellerOnboarding.js:289`

### 5. Dynamic Payment Method Behavior
- What it is: Payment options adapt per booking rules.
- How it appears: Users see allowed methods only (GCash advance, after-service cash, after-service GCash), and proof modal content changes based on flow.
- How it becomes dynamic: The booking object acts as runtime configuration. In `PaymentModal`, computed flags derive available options (`allowsAdvanceGcash`, `allowsAfterServiceCash`, `allowsAfterServiceGcash`). If rules change per booking, the rendered options automatically change because they depend on props and state, not hardcoded branches.
- Utilized at: `src/components/PaymentModal.js:30`, `src/components/PaymentModal.js:33`, `src/components/PaymentModal.js:37`, `src/components/PaymentModal.js:42`, `src/components/PaymentModal.js:74`
- Code proof: `src/components/PaymentModal.js:30`, `src/components/PaymentModal.js:37`, `src/components/PaymentModal.js:88`, `src/pages/MyBookings.js:255`

### 6. Recurring Billing Engine (Weekly/Monthly)
- What it is: One charge per billing cycle with due-date logic.
- How it appears: Bookings show billing badges, next charge dates, and payment prompts only when charge is due.
- How it becomes dynamic: The UI checks billing status against real-time date computations every render. If today reaches/exceeds `nextChargeDate`, `isRecurringChargeDue` becomes `true` and the payment action appears. After proof submission, the app computes and stores the next cycle date, so the same booking automatically transitions to the next billing cycle without manual code changes.
- Utilized at: `src/pages/MyBookings.js:44`, `src/pages/MyBookings.js:62`, `src/pages/MyBookings.js:71`, `src/pages/MyBookings.js:573`, `src/pages/MyBookings.js:307`
- Code proof: `src/pages/MyBookings.js:62`, `src/pages/MyBookings.js:71`, `src/pages/MyBookings.js:288`, `src/pages/MyBookings.js:307`

### 7. Worker Transaction Lock Rules
- What it is: My Work transaction actions are constrained by business conditions.
- How it appears: Some entries allow "Paid" or "Done", others are locked until prior conditions are satisfied.
- How it becomes dynamic: Each transaction row is evaluated by rule functions before controls render. For recurring monthly entries, helper checks (`isMonthlyRecurringTxn`, `isLastCycleEntry`) determine if current row is allowed to toggle paid/done. Since this is recalculated from live row data, lock behavior updates immediately after each user action.
- Utilized at: `src/pages/MyWork.js:367`, `src/pages/MyWork.js:372`, `src/pages/MyWork.js:379`, `src/pages/MyWork.js:395`
- Code proof: `src/pages/MyWork.js:379`, `src/pages/MyWork.js:395`

### 8. Modal-Driven Confirmation UX
- What it is: In-app confirmation modals replace browser popups.
- How it appears: Delete/submit/complete confirmations use consistent overlays and action buttons.
- How it becomes dynamic: The modal only exists when a target state object is populated (`deleteConfirmTarget` or `paymentProofBookingId`). Selecting a record writes target metadata to state, so the modal content is bound to the selected item. Confirm/cancel clears that state, which unmounts the modal and refreshes the underlying list state.
- Utilized at: `src/pages/MyWork.js:222`, `src/pages/MyWork.js:511`, `src/pages/MyWork.js:531`, `src/pages/MyWork.js:547`, `src/pages/MyBookings.js:38`, `src/pages/MyBookings.js:276`
- Code proof: `src/pages/MyWork.js:531`, `src/pages/MyBookings.js:276`, `src/pages/MyBookings.js:654`

### 9. Theme + Language Adaptation
- What it is: UI responds to user preference (light/dark/system and EN/FIL language).
- How it appears: Colors and labels update across pages and persist after reload.
- How it becomes dynamic: Preference values are stored in state and mirrored to `localStorage`. On change, effects update DOM-level classes (`app-theme-dark`/`app-theme-light`) and HTML language code, then settings labels resolve from the translations object. Because render output depends on these reactive values, the whole app adapts instantly and persists after refresh.
- Utilized at: `src/App.js:37`, `src/App.js:42`, `src/App.js:71`, `src/App.js:76`, `src/App.js:169`, `src/App.js:177`, `src/pages/Settings.js:41`, `src/pages/Settings.js:99`, `src/pages/Settings.js:105`
- Code proof: `src/App.js:71`, `src/App.js:76`, `src/App.js:252`, `src/pages/Settings.js:41`, `src/pages/Settings.js:111`

### 10. Responsive Layout Behavior
- What it is: UI layout adapts for desktop and mobile screens.
- How it appears: Grids collapse to single-column, controls stack, spacing changes for small screens.
- How it becomes dynamic: Responsiveness is rule-driven by media queries, so the browser applies different CSS blocks automatically when viewport width crosses breakpoints. The components do not need separate mobile code files; the same markup responds dynamically through CSS condition matching.
- Utilized at: `src/styles/Header.css:189`, `src/styles/Profile.css:312`, `src/styles/MyBookings.css:639`, `src/styles/SellerOnboarding.css:253`
- Code proof: `src/styles/Header.css:189`, `src/styles/Profile.css:313`, `src/styles/MyBookings.css:640`, `src/styles/SellerOnboarding.css:262`

## Quick Defense Script (Short Version)
- Our app is dynamic because screen content is not hardcoded; it is rendered from live state.
- User actions trigger state updates through parent handlers, then React re-renders only affected UI sections.
- Business logic (billing rules, payment permissions, transaction locks) is evaluated in real time per record.
- Modal overlays and multi-step forms are conditionally rendered, so flow changes based on user choices and data validity.
- Theme/language preferences and responsive CSS make the same codebase adapt to user/device context instantly.

---

## Create React App Reference

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

1. Styling Implementation RulesObject-Based Styling: Use the style prop with JavaScript objects instead of strings.CamelCase Syntax: All CSS property names must be converted from kebab-case to camelCase (e.g., background-color becomes backgroundColor, font-size becomes fontSize).Dynamic Logic: Leverage JavaScript expressions, such as ternary operators, to apply styles dynamically based on state or props.Scoped Styles: Ensure styles are defined within the component or passed as specific style objects to maintain scoping.
2. Component & Data ArchitectureProp-Driven Design: Customize components using Props to allow for reusability. Destructure props for cleaner code (e.g., function Welcome({ name })).ES6 Modularity: Split code into small, reusable pieces using import and export. Use Named Exports for multiple utilities and Default Exports for primary components.Dynamic Rendering: Use .map() for rendering lists (like student cards or products) and avoid hardcoding data.State-Driven UI: Ensure the UI reacts immediately to user actions and state changes, such as filtering, sorting, or toggling button states.
3. Constraints & LimitationsNo Pseudo-classes or Media Queries: Do not attempt to use :hover, :focus, or media queries, as they are not supported by inline styles in this context.Project Structure: Maintain a clear project structure with dedicated folders for /components and /data.