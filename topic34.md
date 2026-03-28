By the end of this lesson, students will be able to:
Apply inline styles in React using the style prop.
Dynamically style React elements using JavaScript expressions.Create
reusable, styled components using inline styles.
Pass styling props to child components to control styles externally.
Understand the differences between inline styling and other styling
techniques like external CSS, CSS Modules, and styled-components.
What is Inline Styling?
Inline styling in React is similar to inline CSS in
HTML but with a twist:React uses JavaScript
objects instead of strings for styling.
This allows you to write actual JavaScript logic
directly inside your styles.
Syntax for Inline Styling
const element = <h1 style={{ color: "red",
fontSize: "24px" }}>Hello, Inline
Styles!</h1>;
import React from 'react';
function StyledHeader() {
const headerStyle = {
color: 'blue',
backgroundColor: 'lightgray',
padding: '10px',
borderRadius: '5px',
textAlign: 'center',
};
return <h1 style={headerStyle}>This is a styled header!</h1>;
}
export default StyledHeader;
Styles are written in camelCase, not kebab-case
font-size becomes fontSize
background-color becomes backgroundColor
Advantages:
Scoped styles (applies only to that element).
Dynamic styles using JavaScript logic (e.g.,
ternary operators).
Quick for small components.
Disadvantages:
•Difficult to maintain for large projects.
•No direct support for pseudo-classes like
:hover, :focus, or media queries.
•Inline styles can't use CSS preprocessors like
SASS/SCSS.
Dynamic Inline Styling with JavaScript
Applying Dynamic Styles
One of the biggest benefits of using
inline styles in React is how easily
you can make them dynamic.
const isError = true;
const styles = {
color: isError ? "red" : "green",
fontSize: "20px",
};
const element = <h1 style={styles}>Dynamic Styling</h1>;
We used a ternary operator to change the color based on the value of isError.
You can also use functions or external variables to adjust styling dynamically.
import React from 'react';
function StyledHeader() {
const headerStyle = {
color: 'blue',
backgroundColor: 'lightgray',
padding: '10px',
borderRadius: '5px',
textAlign: 'center',
};
return <h1 style={headerStyle}>This is a styled header!</h1>;
}
function DynamicStyledText() {
const isError = true;
const styles = {
color: isError ? 'red' : 'green',
fontSize: '20px',
textAlign: 'center',
};
return <h2 style={styles}>Dynamic Styling</h2>;
}
export default function App() {
return (
<div>
<StyledHeader />
<DynamicStyledText />
</div>
);
}
button
import React, { useState } from 'react';
function ToggleButton() {
const [isActive, setIsActive] = useState(false);
const buttonStyle = {
backgroundColor: isActive ? "purple" : "gray",
padding: "10px 15px",
color: "white",
border: "none",
borderRadius: "5px",
cursor: "pointer",
fontSize: "16px",
};
return (
<button style={buttonStyle} onClick={() => setIsActive(!isActive)}>
{isActive ? "Active" : "Inactive"}
</button>
);
}
function App() {
return (
<div style={{ textAlign: "center", marginTop: "50px" }}>
<h1>Dynamic Toggle Button</h1>
<ToggleButton />
</div>
);
}
export default App;
Styling React Components with Inline Styles
Custom Button
import React from 'react';
function Button({ color = "blue", text = "Click Me" }) {
const buttonStyle = {
backgroundColor: color,
padding: "10px 20px",
border: "none",
borderRadius: "5px",
color: "white",
cursor: "pointer",
};
return <button style={buttonStyle}>{text}</button>;
}
export default Button;
const App = () => (
<div>
<Button color="blue" text="Click Me" />
<Button color="green" text="Submit" />
</div>
);
The Button component is now reusable.
We control its color and text from the parent.
This approach is useful for creating a component library.
import React from 'react';
// Reusable Button Component
function Button({ color, text }) {
const buttonStyle = {
backgroundColor: color,
padding: "10px 20px",
border: "none",
borderRadius: "5px",
color: "white",
cursor: "pointer",
margin: "5px",
};
return <button style={buttonStyle}>{text}</button>;
}
// Export App properly
const App = () => (
<div style={{ textAlign: "center", marginTop: "50px" }}>
<h1>Reusable Buttons</h1>
<Button color="blue" text="Click Me" />
<Button color="green" text="Submit" />
</div>
);
export default App;
Passing Styling Props to Child Components
Card Component
It is a functional component.
Card(props: object): JSX.Element
This denotes a public function named Card which:Accepts a props
object as an argument.
Returns a JSX element (the rendered output in React).
import React from "react";
import ReactDOM from "react-dom/client";
// Card Component
function Card({ backgroundColor, children }) {
const cardStyle = {
backgroundColor,
padding: "20px",
borderRadius: "10px",
boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
};
return <div style={cardStyle}>{children}</div>;
}
// Main App Component
export default function App() {
return (
<div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
<h1>Card Example</h1>
<Card backgroundColor="#f0f8ff">
<h2>Hello from Card</h2>
<p>This is a simple reusable Card component with custom background color.</p>
</Card>
</div>
);
}
// Render to the DOM
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
Passing Complete Style Object as Props
import React from "react";
import ReactDOM from "react-dom/client";
// CustomBox Component
function CustomBox({ customStyle, children }) {
return <div style={customStyle}>{children}</div>;
}
// Styles object
const boxStyles = {
border: "1px solid black",
padding: "15px",
borderRadius: "5px",
};
Passing Complete Style Object as Props
// App Component
export default function App() { // Added 'export default' here
return (
<div style={{ padding: "20px" }}>
<CustomBox customStyle={boxStyles}>
<h2>This box accepts full styles via props!</h2>
</CustomBox>
</div>
);
}
// Render to DOM
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);