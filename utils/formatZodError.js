// turns zod issues into a short readable list
const formatZodError = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message
  }));

module.exports = formatZodError;
