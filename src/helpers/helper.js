export const isValidMimeType = (file, type) => {
    return file.mimetype === type;
}
export const coerceRequestBody = (body) => ({
    ...body,
    ...['role', 'expirationSeconds'].reduce(
      (acc, cur) => ({ ...acc, [cur]: typeof body[cur] === 'string' ? parseInt(body[cur]) : body[cur] }),
      {}
    )
  })