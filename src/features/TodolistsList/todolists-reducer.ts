import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {appSetStatus, AppSetStatusType, RequestStatusType, setAppError, SetAppErrorType} from "../../app/App-reducer";

const initialState: Array<TodolistDomainType> = []

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'REMOVE-TODOLIST':
            return state.filter(tl => tl.id !== action.id)
        case 'ADD-TODOLIST':
            return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
        case 'CHANGE-TODOLIST-TITLE':
            return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
        case 'CHANGE-TODOLIST-FILTER':
            return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
        case 'SET-TODOLISTS':
            return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        case 'TODOLIST/CHANGE-ENTITY-STATUS':
            return state.map(tl => tl.id === action.todoId? {...tl, entityStatus: action.status}: tl)
        default:
            return state
    }
}

// actions
export const changeEntityStatus = (todoId: string,status: RequestStatusType) => ({type: 'TODOLIST/CHANGE-ENTITY-STATUS',todoId, status} as const)
export const removeTodolistAC = (id: string) => ({type: 'REMOVE-TODOLIST', id} as const)
export const addTodolistAC = (todolist: TodolistType) => ({type: 'ADD-TODOLIST', todolist} as const)
export const changeTodolistTitleAC = (id: string, title: string) => ({
    type: 'CHANGE-TODOLIST-TITLE',
    id,
    title
} as const)
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({
    type: 'CHANGE-TODOLIST-FILTER',
    id,
    filter
} as const)
export const setTodolistsAC = (todolists: Array<TodolistType>) => ({type: 'SET-TODOLISTS', todolists} as const)

// thunks
export const fetchTodolistsTC = () => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(appSetStatus('loading'))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(appSetStatus('idle'))
                dispatch(setTodolistsAC(res.data))
            })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(appSetStatus('loading'))
        dispatch(changeEntityStatus(todolistId,'loading'))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                if(res.data.resultCode === 0) {
                    dispatch(changeEntityStatus(todolistId,'idle'))
                    dispatch(appSetStatus('idle'))
                    dispatch(removeTodolistAC(todolistId))
                } else {
                    dispatch(setAppError(res.data.messages[0]))
                    dispatch(appSetStatus('failed'))
                }
            })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(appSetStatus('loading'))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                if (res.data.resultCode === 0) {
                    dispatch(appSetStatus('idle'))
                    dispatch(addTodolistAC(res.data.data.item))
                } else {
                    dispatch(setAppError(res.data.messages[0]))
                    dispatch(appSetStatus('failed'))
                }
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(appSetStatus('loading'))
        dispatch(changeEntityStatus(id,'loading'))

        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeEntityStatus(id,'idle'))
                dispatch(appSetStatus('idle'))
                dispatch(changeTodolistTitleAC(id, title))
            })
    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
export type ChangeEntityStatusType = ReturnType<typeof changeEntityStatus>
type ActionsType =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | SetTodolistsActionType
    | AppSetStatusType
    | SetAppErrorType
    | ChangeEntityStatusType
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
