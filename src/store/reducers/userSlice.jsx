import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    info: null,
}

export const personSlice = createSlice({
    name: 'person',
    initialState,
    reducers: {
        setPerson: (state, action) => {
            state.info = action.payload;
        },
    },
})