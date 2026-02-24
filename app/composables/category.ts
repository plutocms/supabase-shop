export type Category = Database['public']['Tables']['categories']['Row']

export async function useProductCategory() {
  const toast = useToast()

  const { data: categories, refresh } = await useFetch('/api/category/list', {
    transform: (res) => res.data,
  })

  function getCategoryFromId(id: number | null | undefined): Category | null {
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
  ): Category | null {
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
    onSuccess?: (category: Category) => void
    onError?: (error: Error) => void
    onRequest?: () => void
    onResponse?: () => void
  }

  async function create(options: CreateCategoryOptions) {
    const payload: Omit<Category, 'id' | 'description'> = {
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
          title: `${options.name} created`,
          description: 'Your category has been created successfully.',
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
    refresh,
    getCategoryFromId,
    getCategoryLabelFromId,
    getCategoryFromSlug,
    getCategoryLabelFromSlug,
    create,
  }
}
