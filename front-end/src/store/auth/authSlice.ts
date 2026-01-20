import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import server from "@/src/axiosConfig";
import type { UserProps } from "@/src/classes/User";


const authenticate = createAsyncThunk(
  "authSlice/authenticate",
  async () => {
    return await server.get("/auth")
    .then((res) => {
      return res.data;
    });
  }
);

const login = createAsyncThunk(
  "authSlice/login",
  async (payload:{email:string, password:string}) => {
    return await server.post("/auth/login", {
      ...payload
    })
    .then((res) => {
      return res.data;
    });
  }
);

const signin = createAsyncThunk(
  "authSlice/signin",
  async (payload:{name:string, lastname:string, email:string, taxCode: string, password:string}) => {
    return await server.post("/auth/signin", {
      ...payload
    })
    .then((res) => {
      return res.data;
    });
  }
);

const logout = createAsyncThunk(
  "authSlice/logout",
  async () => {
    return await server.get("/auth/logout")
    .then((res) => {
      return res.data;
    });
  }
);

const refreshToken = createAsyncThunk(
  "authSlice/refreshToken",
  async () => {
    return await server.get("/auth/refreshToken")
    .then((res) => {
      return res.data;
    });
  }
);

const verifyOtp = createAsyncThunk(
  "authSlice/verifyOtp",
  async (payload:{code:string}) => {
    return await server.post("/auth/verifyOtp", {
      code: payload.code
    })
    .then((res) => {
      return res.data;
    }).catch((err) => {
      throw err.response.data
    });
  }
);

const resendOtp = createAsyncThunk(
  "authSlice/resendOtp",
  async () => {
    return await server.get("/auth/resendOtp")
    .then((res) => {
      return res.data;
    })
  }
);


const initialState:AuthSliceProps = {
  user: null,
  loading: true,
  isAuthenticated: false
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(authenticate.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(authenticate.rejected, (state) => {
      state.isAuthenticated = false;
      state.loading = false;
    });
    builder.addCase(signin.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
    });
    builder.addCase(signin.rejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(login.rejected, (state) => {
      state.isAuthenticated = false;
      state.loading = false;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
    });
    builder.addCase(logout.rejected, (state) => {
      state.isAuthenticated = true;
    });
    builder.addCase(refreshToken.fulfilled, (state) => {
      state.isAuthenticated = true;
    });
    builder.addCase(refreshToken.rejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
    });
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addCase(resendOtp.fulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addCase(resendOtp.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
  }
});


export const authSliceActions = {
  authenticate,
  refreshToken,
  verifyOtp,
  resendOtp,
  login,
  signin,
  logout,
  ...authSlice.actions,
};
export default authSlice.reducer;

type AuthSliceProps = {
  user: UserProps | null;
  loading: boolean;
  isAuthenticated: boolean;
}

