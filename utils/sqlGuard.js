const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

const normalizeSortOrder = (sortOrder = 'DESC', fallback = 'DESC') => {
  const normalized = `${sortOrder || ''}`.trim().toUpperCase()
  if (normalized === 'ASC' || normalized === 'DESC') {
    return normalized
  }
  return fallback
}

const normalizeSortBy = (sortBy, allowedFields = [], fallback) => {
  const normalized = `${sortBy || ''}`.trim()
  if (allowedFields.includes(normalized)) {
    return normalized
  }
  return fallback
}

const sanitizeSort = ({
  sortBy,
  sortOrder,
  allowedFields = [],
  defaultSortBy,
  defaultSortOrder = 'DESC',
}) => {
  return {
    sortBy: normalizeSortBy(sortBy, allowedFields, defaultSortBy),
    sortOrder: normalizeSortOrder(sortOrder, defaultSortOrder),
  }
}

const pickAllowedFields = (data = {}, allowedFields = []) => {
  const safe = {}
  allowedFields.forEach((field) => {
    if (hasOwn(data, field) && data[field] !== undefined) {
      safe[field] = data[field]
    }
  })
  return safe
}

module.exports = {
  sanitizeSort,
  pickAllowedFields,
}
