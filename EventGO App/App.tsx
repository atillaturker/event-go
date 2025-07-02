import React from "react";
import RootNavigator from "./src/navigation/RootNavigator";

import { Provider } from "react-redux";
import reduxStore from "./src/store/reduxStore";

export default function App(): React.JSX.Element {
  return (
    <Provider store={reduxStore}>
      <RootNavigator />
    </Provider>
  );
}
