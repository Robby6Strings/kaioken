import { createContext, useContext } from "kaioken"

export const SearchContext = createContext("")
export const useSearch = () => useContext(SearchContext)
