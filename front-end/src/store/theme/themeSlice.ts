import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState:ThemeSliceProps = {
  mode: (localStorage.getItem("mode") as "light"|"dark") ?? "light"
}

const themeSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (payload, action:PayloadAction<{mode: "light"|"dark"}>) => {
      const {mode} = action.payload;
      payload.mode = mode;
      localStorage.setItem("mode", mode);
    }
  },
});


export const themeSliceActions = {
  ...themeSlice.actions,
};
export default themeSlice.reducer;

type ThemeSliceProps = {
  mode: "light"|"dark"
}