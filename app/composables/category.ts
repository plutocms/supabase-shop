export type ProductCategory =
  Database['public']['Tables']['product_category']['Row']

interface UseProductCategoryOptions {
  /**
   * When true, the fetch does not block navigation, and the list is empty
   * while `pending` is true. The default is false: the call waits for the
   * list, because store pages read it right after `await` (for example to
   * find a category by its slug, or to answer 404).
   */
  lazy?: boolean
}

export async function useProductCategory(
  options: UseProductCategoryOptions = {}
) {
  const toast = useToast()
  const { t } = usePlutoI18n()

  const { data: categories, refresh, pending } = await useFetch(
    '/api/category/list',
    {
      lazy: options.lazy ?? false,
      transform: (res) => res.data,
    }
  )

  function getCategoryFromId(
    id: number | null | undefined
  ): ProductCategory | null {
    if (!id) {
      return null
    }

    const category = categories.value?.find((item) => item.id === id)

    return category ?? null
  }

  function getCategoryLabelFromId(
    id: number | null | undefined
  ): string | null {
    if (!id) {
      return null
    }

    const category = getCategoryFromId(id)

    return category ? category.label : null
  }

  function getCategoryFromSlug(
    slug: string | string[] | null | undefined
  ): ProductCategory | null {
    if (!slug) {
      return null
    }

    const category = categories.value?.find((item) => item.slug === slug)

    return category ?? null
  }

  function getCategoryLabelFromSlug(
    slug: string | null | undefined
  ): string | null {
    if (!slug) {
      return null
    }

    const category = getCategoryFromSlug(slug)

    return category ? category.label : null
  }

  interface CreateCategoryOptions {
    name: string
    description?: string
    onSuccess?: (category: ProductCategory) => void
    onError?: (error: Error) => void
    onRequest?: () => void
    onResponse?: () => void
  }

  async function create(options: CreateCategoryOptions) {
    const payload: Omit<ProductCategory, 'id' | 'description'> = {
      label: options.name,
      slug: slugify(options.name),
    }

    if (options.onRequest) {
      options.onRequest()
    }

    await $fetch('/api/category/new', {
      method: 'POST',
      body: payload,
    })
      .then(async (response) => {
        await refresh()

        if (options.onSuccess) {
          options.onSuccess(response.data)
        }

        toast.add({
          title: t('supabase-shop.category.created', { name: options.name }),
          description: t('supabase-shop.category.createdDescription'),
          color: 'success',
        })
      })
      .catch((error) => {
        console.error(error.message)
      })
      .finally(() => {
        if (options.onResponse) {
          options.onResponse()
        }
      })
  }

  return {
    categories,
    pending,
    refresh,
    getCategoryFromId,
    getCategoryLabelFromId,
    getCategoryFromSlug,
    getCategoryLabelFromSlug,
    create,
  }
}
