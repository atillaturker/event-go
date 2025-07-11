import React from "react";
import { Provider } from "react-redux";
import RootNavigator from "./src/navigation/RootNavigator";
import reduxStore from "./src/store/reduxStore";

// Google Fonts

export default function App(): React.JSX.Element | null {
  return (
    <Provider store={reduxStore}>
      <RootNavigator />
    </Provider>
  );
}
