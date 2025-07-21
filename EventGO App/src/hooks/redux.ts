import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/reduxStore";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
