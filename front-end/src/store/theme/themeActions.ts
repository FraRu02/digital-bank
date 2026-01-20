import store from "@/src/store/rootReducer";
import { themeSliceActions } from "./themeSlice";

export const setThemeMode = (mode:"light"|"dark"):void => {
  store.dispatch(themeSliceActions.setMode({mode}));
}

