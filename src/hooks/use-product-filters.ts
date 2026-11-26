import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DEFAULT_FILTERS, filtersFromParams, filtersToParams, type ProductFilters } from '@/lib/product-filters'

/** Filtros da lista de produtos guardados na URL (sobrevivem a F5 e a "voltar" do detalhe). */
export function useProductFilters() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => filtersFromParams(params), [params])

  const update = useCallback((patch: Partial<ProductFilters>) => {
    setParams(prev => filtersToParams({ ...filtersFromParams(prev), ...patch }), { replace: true })
  }, [setParams])

  // limpa só os filtros avançados (mantém busca, aba e ordenação)
  const clearAdvanced = useCallback(() => {
    update({ cat: '', sup: '', st: '', smin: undefined, smax: undefined, pmin: undefined, pmax: undefined })
  }, [update])

  const clearAll = useCallback(() => setParams(filtersToParams(DEFAULT_FILTERS), { replace: true }), [setParams])

  return { filters, update, clearAdvanced, clearAll }
}
