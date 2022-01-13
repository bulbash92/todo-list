//
import {Dispatch} from "redux";
import {setIsLoggedInAC} from "../features/Login/LoginReducer";
import {authApi} from "../api/todolists-api";

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const initialState = {
    status: 'idle' as RequestStatusType,
    isError: null as string | null,
    isInitialized: false
}

type InitialStateType = typeof initialState

export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case 'SET-IS-INITIALIZED':
            return {...state, isInitialized: action.initialized}
        case 'APP/SET-STATUS':
            return {...state, status: action.status}
        case 'APP/SET-ERROR':
            return {...state, isError: action.error}
        default:
            return state
    }
}

export const setIsInitialized = (initialized: boolean) => ({type: 'SET-IS-INITIALIZED', initialized} as const)

export const appSetStatus = (status: RequestStatusType) => {
    return {
        type: 'APP/SET-STATUS',
        status
    } as const
}

export const initializeApp = () => (dispatch: Dispatch) => {
    authApi.me()
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedInAC(true))
            }
        })
        .finally(() => {
                dispatch(setIsInitialized(true))
            }
        )
}

export const setAppError = (error: string | null) => ({type: 'APP/SET-ERROR', error} as const)
export type SetIsInitializedType = ReturnType<typeof setIsInitialized>
export type SetAppErrorType = ReturnType<typeof setAppError>
export type AppSetStatusType = ReturnType<typeof appSetStatus>
type ActionsType = AppSetStatusType | SetAppErrorType | SetIsInitializedType