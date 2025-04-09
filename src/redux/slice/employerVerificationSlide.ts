import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { callGetPendingEmployers } from "@/config/api";
import { IUser, IModelPaginate, IBackendRes } from "@/types/backend";

interface IState {
    isFetching: boolean;
    error: string | null;
    result: IUser[];
    meta: {
        current: number;
        pageSize: number;
        total: number;
    };
}

const initialState: IState = {
    isFetching: false,
    error: null,
    result: [],
    meta: {
        current: 1,
        pageSize: 10,
        total: 0
    }
};

export const fetchPendingEmployers = createAsyncThunk(
    'employerVerification/fetchPendingEmployers',
    async (query: string) => {
        const res = await callGetPendingEmployers(query);
        return res;
    }
);

const employerVerificationSlice = createSlice({
    name: "employerVerification",
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPendingEmployers.pending, (state) => {
                state.isFetching = true;
                state.error = null;
            })
            .addCase(fetchPendingEmployers.fulfilled, (state, action) => {
                state.isFetching = false;
                const response = action.payload as IBackendRes<IModelPaginate<IUser>>;
                if (response?.data) {
                    state.result = response.data.result;
                    state.meta = {
                        current: response.data.meta.page,
                        pageSize: response.data.meta.pageSize,
                        total: response.data.meta.total
                    };
                }
            })
            .addCase(fetchPendingEmployers.rejected, (state, action) => {
                state.isFetching = false;
                state.error = action.error.message || 'Có lỗi xảy ra';
            });
    }
});

export const { reset } = employerVerificationSlice.actions;
export default employerVerificationSlice.reducer; 